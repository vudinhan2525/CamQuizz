using CamQuizzBE.Applications.DTOs.Reports;

namespace CamQuizzBE.Domain.Interfaces;

public interface IReportService
{
    Task<AuthorReportDto> GenerateAuthorReportAsync(int quizId, int authorId);
    Task<OldAttemptReportDto> GenerateOldAttemptReportAsync(int attemptId, int userId);
    Task<List<OldAttemptReportDto>> GetUserAttemptsAsync(int userId, int quizId);
    Task<List<OldAttemptReportDto>> GetAttemptsByUserAsync(int userId, int limit, int page, string sort);
    Task<List<QuizHistoryDto>> GetMyQuizHistoryAsync(int userId, int? limit = 10, int? page = 1);
    Task<QuizPlayReportDto> GenerateQuizPlayReportAsync(string gameId);
}