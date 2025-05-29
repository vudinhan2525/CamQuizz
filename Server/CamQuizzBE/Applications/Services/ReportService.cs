using CamQuizzBE.Applications.DTOs.Reports;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Infras.Data;
using CamQuizzBE.Presentation.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace CamQuizzBE.Applications.Services;

public class ReportService : IReportService
{
    private readonly DataContext _context;
    private readonly ILogger<ReportService> _logger;

    public ReportService(DataContext context, ILogger<ReportService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<QuizHistoryDto>> GetMyQuizHistoryAsync(int userId, int? limit = 10, int? page = 1)
    {
        var query = _context.QuizAttempts
            .Include(a => a.Quiz)
                .ThenInclude(q => q.Genre)
            .Where(a => a.UserId == userId)
            .GroupBy(a => new { a.Quiz.Id, a.Quiz.Name, a.Quiz.Image, a.Quiz.GenreId, GenreName = a.Quiz.Genre.Name })
            .Select(g => new QuizHistoryDto
            {
                QuizId = g.Key.Id,
                QuizName = g.Key.Name,
                QuizImage = g.Key.Image,
                GenreId = g.Key.GenreId,
                GenreName = g.Key.GenreName,
                AttemptCount = g.Count(),
                BestScore = g.Max(a => a.Score),
                LastAttemptDate = g.Max(a => a.StartTime)
            });

        if (page.HasValue && limit.HasValue)
        {
            query = query.Skip((page.Value - 1) * limit.Value).Take(limit.Value);
        }

        return await query.OrderByDescending(h => h.LastAttemptDate).ToListAsync();
    }

    public async Task<AuthorReportDto> GenerateAuthorReportAsync(int quizId, int authorId)
    {
        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
                .ThenInclude(q => q.Answers)
            .FirstOrDefaultAsync(q => q.Id == quizId && q.UserId == authorId);

        if (quiz == null)
        {
            throw new NotFoundException($"Quiz not found or you don't have permission to access it");
        }

        var report = new AuthorReportDto();
        report.TotalAttempts = await _context.QuizAttempts
            .Where(a => a.QuizId == quizId)
            .CountAsync();

        foreach (var question in quiz.Questions)
        {
            var stats = new QuestionStatsDto
            {
                QuestionId = question.Id,
                QuestionName = question.Name
            };

            var userAnswers = await _context.UserAnswers
                .Include(ua => ua.Attempt)
                .Include(ua => ua.Answer)
                .Where(ua => ua.QuestionId == question.Id)
                .Where(ua => ua.Attempt.QuizId == quizId)
                .ToListAsync();

            var validAnswers = userAnswers.Where(a =>
                a.AnswerId.HasValue &&
                a.AnswerTime.HasValue &&
                a.AnswerTime.Value >= 0 &&
                a.AnswerTime.Value <= question.Duration);

            stats.AverageAnswerTime = validAnswers.Any()
                ? validAnswers.Average(a => a.AnswerTime.Value)
                : 0;

            var answeredAttempts = userAnswers.Count(a => a.AnswerId.HasValue);
            foreach (var option in question.Answers)
            {
                var selections = userAnswers.Count(a => a.AnswerId == option.Id);
                var rate = answeredAttempts > 0 ? (selections * 100.0) / answeredAttempts : 0;

                stats.OptionStats.Add(new OptionStatsDto
                {
                    AnswerId = option.Id,
                    AnswerText = option.Answer,
                    SelectionRate = rate
                });
            }
            report.QuestionStats.Add(stats);
        }

        var scores = await _context.QuizAttempts
            .Where(a => a.QuizId == quizId)
            .GroupBy(a => a.Score)
            .Select(g => new { Score = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Score, x => x.Count);

        report.ScoreDistribution = scores;

        return report;
    }

    public async Task<OldAttemptReportDto> GenerateOldAttemptReportAsync(int attemptId, int userId)
    {
        var attempt = await _context.QuizAttempts
            .Include(a => a.Quiz)
                .ThenInclude(q => q.Genre)
            .Include(a => a.UserAnswers)
                .ThenInclude(a => a.Question)
            .Include(a => a.UserAnswers)
                .ThenInclude(a => a.Answer)
            .FirstOrDefaultAsync(a => a.Id == attemptId && a.UserId == userId);

        if (attempt == null)
        {
            throw new NotFoundException("Attempt not found or you don't have permission to access it");
        }

        var report = new OldAttemptReportDto
        {
            AttemptNumber = 1,
            Timestamp = attempt.StartTime,
            Score = attempt.Score,
            Duration = attempt.EndTime.HasValue ? (attempt.EndTime.Value - attempt.StartTime) : null,
            QuizId = attempt.QuizId,
            QuizName = attempt.Quiz.Name,
            QuizImage = attempt.Quiz.Image,
            GenreId = attempt.Quiz.GenreId,
            GenreName = attempt.Quiz.Genre.Name,
            TotalQuestions = attempt.Quiz.NumberOfQuestions,
            TotalCorrect = attempt.UserAnswers.Count(ua => ua.Answer?.IsCorrect == true)
        };

        report.AccuracyRate = report.TotalQuestions > 0
            ? (double)report.TotalCorrect / report.TotalQuestions * 100
            : 0;

        var answersGrouped = attempt.UserAnswers
            .OrderBy(a => a.Question.Id)
            .GroupBy(a => a.Question);

        foreach (var questionGroup in answersGrouped)
        {
            var question = questionGroup.Key;
            var review = new QuestionReviewDto
            {
                QuestionId = question.Id,
                QuestionName = question.Name
            };

            foreach (var userAnswer in questionGroup)
            {
                if (userAnswer.Answer != null)
                {
                    review.SelectedAnswers.Add(new SelectedAnswerDto
                    {
                        AnswerId = userAnswer.Answer.Id,
                        AnswerText = userAnswer.Answer.Answer,
                        IsCorrect = userAnswer.Answer.IsCorrect
                    });
                }
            }

            var correctAnswers = await _context.Answers
                .Where(a => a.QuestionId == question.Id && a.IsCorrect)
                .ToListAsync();

            foreach (var answer in correctAnswers)
            {
                review.CorrectAnswers.Add(new SelectedAnswerDto
                {
                    AnswerId = answer.Id,
                    AnswerText = answer.Answer,
                    IsCorrect = true
                });
            }

            report.QuestionReviews.Add(review);
        }

        return report;
    }

    public async Task<List<OldAttemptReportDto>> GetUserAttemptsAsync(int userId, int quizId)
    {
        var attempts = await _context.QuizAttempts
            .Include(a => a.Quiz)
                .ThenInclude(q => q.Genre)
            .Include(a => a.UserAnswers)
                .ThenInclude(a => a.Question)
            .Include(a => a.UserAnswers)
                .ThenInclude(a => a.Answer)
            .Where(a => a.UserId == userId && a.QuizId == quizId)
            .OrderByDescending(a => a.StartTime)
            .ToListAsync();

        _logger.LogInformation(
            "Found {Count} attempts for user {UserId} on quiz {QuizId}",
            attempts.Count, userId, quizId);

        var reports = new List<OldAttemptReportDto>();
        for (int i = 0; i < attempts.Count; i++)
        {
            var attempt = attempts[i];
            var report = new OldAttemptReportDto
            {
                AttemptNumber = attempts.Count - i,
                Timestamp = attempt.StartTime,
                Score = attempt.Score,
                Duration = attempt.EndTime.HasValue ? (attempt.EndTime.Value - attempt.StartTime) : null,
                QuizId = attempt.QuizId,
                QuizName = attempt.Quiz.Name,
                QuizImage = attempt.Quiz.Image,
                GenreId = attempt.Quiz.GenreId,
                GenreName = attempt.Quiz.Genre.Name,
                TotalQuestions = attempt.Quiz.NumberOfQuestions,
                TotalCorrect = attempt.UserAnswers.Count(ua => ua.Answer?.IsCorrect == true)
            };

            report.AccuracyRate = report.TotalQuestions > 0
                ? (double)report.TotalCorrect / report.TotalQuestions * 100
                : 0;

            var answersGrouped = attempt.UserAnswers
                .OrderBy(a => a.Question.Id)
                .GroupBy(a => a.Question);

            foreach (var questionGroup in answersGrouped)
            {
                var question = questionGroup.Key;
                var review = new QuestionReviewDto
                {
                    QuestionId = question.Id,
                    QuestionName = question.Name
                };

                foreach (var userAnswer in questionGroup)
                {
                    if (userAnswer.Answer != null)
                    {
                        review.SelectedAnswers.Add(new SelectedAnswerDto
                        {
                            AnswerId = userAnswer.Answer.Id,
                            AnswerText = userAnswer.Answer.Answer,
                            IsCorrect = userAnswer.Answer.IsCorrect
                        });
                    }
                }

                var correctAnswers = await _context.Answers
                    .Where(a => a.QuestionId == question.Id && a.IsCorrect)
                    .ToListAsync();

                foreach (var answer in correctAnswers)
                {
                    review.CorrectAnswers.Add(new SelectedAnswerDto
                    {
                        AnswerId = answer.Id,
                        AnswerText = answer.Answer,
                        IsCorrect = true
                    });
                }

                report.QuestionReviews.Add(review);
            }

            reports.Add(report);
        }

        return reports;
    }

    public async Task<List<OldAttemptReportDto>> GetAttemptsByUserAsync(int userId, int limit, int page, string sort)
    {
        var attempts = await _context.QuizAttempts
            .Include(a => a.Quiz)
                .ThenInclude(q => q.Genre)
            .Include(a => a.UserAnswers)
                .ThenInclude(ua => ua.Question)
            .Include(a => a.UserAnswers)
                .ThenInclude(ua => ua.Answer)
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.StartTime)
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync();

        var reports = new List<OldAttemptReportDto>();
        foreach (var attempt in attempts)
        {
            var report = new OldAttemptReportDto
            {
                AttemptNumber = attempt.Id,
                Timestamp = attempt.StartTime,
                Score = attempt.Score,
                Duration = attempt.EndTime.HasValue ? (attempt.EndTime.Value - attempt.StartTime) : null,
                QuizId = attempt.QuizId,
                QuizName = attempt.Quiz.Name,
                QuizImage = attempt.Quiz.Image,
                GenreId = attempt.Quiz.GenreId,
                GenreName = attempt.Quiz.Genre.Name,
                TotalQuestions = attempt.Quiz.NumberOfQuestions,
                TotalCorrect = attempt.UserAnswers.Count(ua => ua.Answer?.IsCorrect == true)
            };

            report.AccuracyRate = report.TotalQuestions > 0
                ? (double)report.TotalCorrect / report.TotalQuestions * 100
                : 0;

            var answersGrouped = attempt.UserAnswers
                .OrderBy(a => a.Question.Id)
                .GroupBy(a => a.Question);

            foreach (var questionGroup in answersGrouped)
            {
                var question = questionGroup.Key;
                var review = new QuestionReviewDto
                {
                    QuestionId = question.Id,
                    QuestionName = question.Name
                };

                foreach (var userAnswer in questionGroup)
                {
                    if (userAnswer.Answer != null)
                    {
                        review.SelectedAnswers.Add(new SelectedAnswerDto
                        {
                            AnswerId = userAnswer.Answer.Id,
                            AnswerText = userAnswer.Answer.Answer,
                            IsCorrect = userAnswer.Answer.IsCorrect
                        });
                    }
                }

                var correctAnswers = await _context.Answers
                    .Where(a => a.QuestionId == question.Id && a.IsCorrect)
                    .ToListAsync();

                foreach (var answer in correctAnswers)
                {
                    review.CorrectAnswers.Add(new SelectedAnswerDto
                    {
                        AnswerId = answer.Id,
                        AnswerText = answer.Answer,
                        IsCorrect = true
                    });
                }

                report.QuestionReviews.Add(review);
            }

            reports.Add(report);
        }

        return reports;
    }
}