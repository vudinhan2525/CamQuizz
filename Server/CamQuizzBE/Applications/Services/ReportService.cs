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

        // Calculate total attempts
        report.TotalAttempts = await _context.QuizAttempts
            .Where(a => a.QuizId == quizId)
            .CountAsync();

        // Calculate per-question statistics
        foreach (var question in quiz.Questions)
        {
            var stats = new QuestionStatsDto
            {
                QuestionId = question.Id,
                QuestionName = question.Name
            };

            // Get all answers for this question from UserAnswers
            var userAnswers = await _context.UserAnswers
                .Where(a => a.QuestionId == question.Id)
                .Where(a => a.Attempt.QuizId == quizId)
                .ToListAsync();

            // Calculate average answer time
            stats.AverageAnswerTime = userAnswers.Any()
                ? userAnswers.Where(a => a.AnswerTime.HasValue)
                           .Average(a => a.AnswerTime.Value)
                : 0;

            // Calculate option selection rates per answer
            foreach (var option in question.Answers)
            {
                var selections = userAnswers.Count(a => a.AnswerId == option.Id);
                var rate = userAnswers.Any()
                    ? (selections * 100.0) / userAnswers.Count
                    : 0;

                stats.OptionStats.Add(new OptionStatsDto
                {
                    AnswerId = option.Id,
                    AnswerText = option.Answer,
                    SelectionRate = rate
                });
            }

            report.QuestionStats.Add(stats);
        }

        // Calculate score distribution
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
            AttemptNumber = 1, // You might want to calculate this based on previous attempts
            Timestamp = attempt.StartTime,
            Score = attempt.Score
        };

        // Group answers by question for the review
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

            // Add all selected answers for this question
            foreach (var userAnswer in questionGroup)
            {
                review.SelectedAnswers.Add(new SelectedAnswerDto
                {
                    AnswerId = userAnswer.Answer.Id,
                    AnswerText = userAnswer.Answer.Answer,
                    IsCorrect = userAnswer.Answer.IsCorrect
                });
            }


            report.QuestionReviews.Add(review);
        }

        return report;
    }
}