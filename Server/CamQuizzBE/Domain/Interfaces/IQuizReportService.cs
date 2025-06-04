using CamQuizzBE.Applications.DTOs.Reports;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Enums;

namespace CamQuizzBE.Domain.Interfaces;

public interface IQuizReportService
{
    // User operations
    Task CreateReportAsync(CreateQuizReportDto reportDto);
    Task<PagedResult<QuizReportDto>> GetUserReportsAsync(int userId, int page = 1, int limit = 10);
    // Admin operations
    Task<PagedResult<QuizReportDto>> GetReportsAsync(string? search, ReportStatus? status, int page, int limit);
    Task<PagedResult<QuizReportDto>> GetReportsForQuizAsync(int quizId, int page = 1, int limit = 10);
    Task<QuizReportDto> UpdateReportAsync(int reportId, UpdateQuizReportDto updateDto);

    // Statistics
    Task<ReportStatisticsDto> GetReportStatisticsAsync();
}