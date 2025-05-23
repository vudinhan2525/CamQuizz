using CamQuizzBE.Applications.DTOs.Reports;

namespace CamQuizzBE.Domain.Interfaces;

public interface IReportService
{
    Task<AuthorReportDto> GenerateAuthorReportAsync(int quizId, int authorId);
    Task<OldAttemptReportDto> GenerateOldAttemptReportAsync(int attemptId, int userId);
    Task<List<OldAttemptReportDto>> GetUserAttemptsAsync(int userId, int quizId);
}