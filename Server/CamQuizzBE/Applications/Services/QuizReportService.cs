using CamQuizzBE.Applications.DTOs.Reports;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Enums;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Domain.Repositories;
using CamQuizzBE.Infras.Data;
using Microsoft.EntityFrameworkCore;

namespace CamQuizzBE.Applications.Services;

public class QuizReportService : IQuizReportService
{
    private readonly DataContext _context;

    public QuizReportService(DataContext context)
    {
        _context = context;
    }

    private static string GetActionDisplay(QuizReportAction? action) => action switch
    {
        QuizReportAction.Keep => "Quiz was kept",
        QuizReportAction.SoftDelete => "Quiz was soft deleted",
        QuizReportAction.HardDelete => "Quiz was permanently deleted",
        _ => null
    };

    public async Task CreateReportAsync(CreateQuizReportDto reportDto)
    {
        var quiz = await _context.Quizzes.FindAsync(reportDto.QuizId)
            ?? throw new KeyNotFoundException($"Quiz with ID {reportDto.QuizId} not found");

        var reporter = await _context.Users.FindAsync(reportDto.ReporterId)
            ?? throw new KeyNotFoundException($"User with ID {reportDto.ReporterId} not found");

        var report = new QuizReport
        {
            QuizId = reportDto.QuizId,
            ReporterId = reportDto.ReporterId,
            Message = reportDto.Message,
            Status = ReportStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        await _context.QuizReports.AddAsync(report);
        await _context.SaveChangesAsync();
    }

    public async Task<PagedResult<QuizReportDto>> GetUserReportsAsync(int userId, int page = 1, int limit = 10)
    {
        var query = _context.QuizReports
            .Where(r => r.ReporterId == userId)
            .GroupBy(r => r.QuizId)
            .Select(g => new
            {
                QuizId = g.Key,
                Quiz = g.First().Quiz,
                Reports = g.ToList()
            });

        var total = await query.CountAsync();

        var reports = await query
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync();

        var items = reports.Select(r => new QuizReportDto
        {
            Id = r.Reports.First().Id,
            QuizId = r.QuizId,
            QuizName = r.Quiz.Name,
            ReporterId = userId,
            Message = r.Reports.First().Message,
            Status = r.Reports.First().Status,
            Action = r.Reports.First().Action,
            AdminNote = r.Reports.First().AdminNote,
            CreatedAt = r.Reports.First().CreatedAt,
            ResolvedAt = r.Reports.First().ResolvedAt,
            ResolvedByName = r.Reports.First().ResolvedBy?.UserName,
            TotalReports = r.Reports.Count,
            PendingReports = r.Reports.Count(x => x.Status == ReportStatus.Pending),
            ResolvedReports = r.Reports.Count(x => x.Status == ReportStatus.Resolved),
            ActionDisplay = GetActionDisplay(r.Reports.First().Action)
        }).ToList();

        return new PagedResult<QuizReportDto>(items, total, page, limit);
    }

    public async Task<PagedResult<QuizReportDto>> GetReportsAsync(string? search, ReportStatus? status, int page, int limit)
    {
        // First get paginated reports
        var query = _context.QuizReports
            .Include(r => r.Reporter)
            .Include(r => r.ResolvedBy)
            .Include(r => r.Quiz)
            .Where(r => !string.IsNullOrEmpty(search) ?
                r.Quiz.Name.Contains(search) ||
                r.Message.Contains(search) ||
                r.Reporter.UserName.Contains(search) : true)
            .Where(r => status.HasValue ? r.Status == status.Value : true)
            .OrderByDescending(r => r.CreatedAt);

        var total = await query.CountAsync();
        
        var reports = await query
            .Skip((page - 1) * limit)
            .Take(limit)
            .Select(r => new
            {
                Report = r,
                Counts = _context.QuizReports
                    .Where(qr => qr.QuizId == r.QuizId)
                    .GroupBy(qr => 1)
                    .Select(g => new
                    {
                        Total = g.Count(),
                        Pending = g.Count(qr => qr.Status == ReportStatus.Pending),
                        Resolved = g.Count(qr => qr.Status == ReportStatus.Resolved)
                    })
                    .FirstOrDefault()
            })
            .ToListAsync();

        var items = reports.Select(r => new QuizReportDto
        {
            Id = r.Report.Id,
            QuizId = r.Report.QuizId,
            QuizName = r.Report.Quiz.Name,
            ReporterName = r.Report.Reporter.UserName,
            Message = r.Report.Message,
            Status = r.Report.Status,
            Action = r.Report.Action,
            AdminNote = r.Report.AdminNote,
            CreatedAt = r.Report.CreatedAt,
            ResolvedAt = r.Report.ResolvedAt,
            ResolvedByName = r.Report.ResolvedBy?.UserName,
            TotalReports = r.Counts?.Total ?? 0,
            PendingReports = r.Counts?.Pending ?? 0,
            ResolvedReports = r.Counts?.Resolved ?? 0,
            ActionDisplay = GetActionDisplay(r.Report.Action)
        }).ToList();

        return new PagedResult<QuizReportDto>(items, total, page, limit);
    }

    public async Task<PagedResult<QuizReportDto>> GetReportsForQuizAsync(int quizId, int page = 1, int limit = 10)
    {
        var query = _context.QuizReports
            .Where(r => r.QuizId == quizId)
            .OrderByDescending(r => r.CreatedAt);

        var total = await query.CountAsync();

        var reports = await query
            .Skip((page - 1) * limit)
            .Take(limit)
            .Select(r => new QuizReportDto
            {
                Id = r.Id,
                QuizId = r.QuizId,
                QuizName = r.Quiz.Name,
                ReporterId = r.ReporterId,
                ReporterName = r.Reporter.UserName,
                Message = r.Message,
                Status = r.Status,
                Action = r.Action,
                AdminNote = r.AdminNote,
                CreatedAt = r.CreatedAt,
                ResolvedAt = r.ResolvedAt,
                ResolvedByName = r.ResolvedBy.UserName,
                ActionDisplay = GetActionDisplay(r.Action)
            })
            .ToListAsync();

        if (reports.Any())
        {
            var reportCounts = await _context.QuizReports
                .Where(r => r.QuizId == quizId)
                .GroupBy(r => r.QuizId)
                .Select(g => new
                {
                    Total = g.Count(),
                    Pending = g.Count(r => r.Status == ReportStatus.Pending),
                    Resolved = g.Count(r => r.Status == ReportStatus.Resolved)
                })
                .FirstAsync();

            reports.ForEach(r =>
            {
                r.TotalReports = reportCounts.Total;
                r.PendingReports = reportCounts.Pending;
                r.ResolvedReports = reportCounts.Resolved;
            });
        }

        return new PagedResult<QuizReportDto>(reports, total, page, limit);
    }

    public async Task<QuizReportDto> UpdateReportAsync(int reportId, UpdateQuizReportDto updateDto)
    {
        var report = await _context.QuizReports
            .Include(r => r.Quiz)
            .Include(r => r.Reporter)
            .Include(r => r.ResolvedBy)
            .FirstOrDefaultAsync(r => r.Id == reportId)
            ?? throw new KeyNotFoundException($"Report with ID {reportId} not found");

        report.Status = updateDto.Status;
        report.Action = updateDto.Action;
        report.AdminNote = updateDto.AdminNote;
        report.ResolvedById = updateDto.AdminId;
        report.ResolvedAt = DateTime.UtcNow;

        // Handle the action
        var quiz = await _context.Quizzes.FindAsync(report.QuizId);
        if (quiz != null)
        {
            switch (updateDto.Action)
            {
                case QuizReportAction.Keep:
                    quiz.IsDeleted = false;
                    _context.Quizzes.Update(quiz);
                    break;
                case QuizReportAction.SoftDelete:
                    quiz.IsDeleted = true;
                    _context.Quizzes.Update(quiz);
                    // Update all pending reports for this quiz to resolved
                    await UpdatePendingReportsToResolved(quiz.Id, updateDto.AdminId, reportId);
                    break;
                case QuizReportAction.HardDelete:
                    _context.Quizzes.Remove(quiz);
                    // Update all pending reports for this quiz to resolved
                    await UpdatePendingReportsToResolved(quiz.Id, updateDto.AdminId, reportId);
                    break;
            }
        }

        await _context.SaveChangesAsync();

        var reportCounts = await _context.QuizReports
            .Where(r => r.QuizId == report.QuizId)
            .GroupBy(r => r.QuizId)
            .Select(g => new
            {
                Total = g.Count(),
                Pending = g.Count(r => r.Status == ReportStatus.Pending),
                Resolved = g.Count(r => r.Status == ReportStatus.Resolved)
            })
            .FirstAsync();

        return new QuizReportDto
        {
            Id = report.Id,
            QuizId = report.QuizId,
            QuizName = report.Quiz.Name,
            ReporterId = report.ReporterId,
            ReporterName = report.Reporter.UserName,
            Message = report.Message,
            Status = report.Status,
            Action = report.Action,
            AdminNote = report.AdminNote,
            CreatedAt = report.CreatedAt,
            ResolvedAt = report.ResolvedAt,
            ResolvedByName = report.ResolvedBy?.UserName,
            TotalReports = reportCounts.Total,
            PendingReports = reportCounts.Pending,
            ResolvedReports = reportCounts.Resolved,
            ActionDisplay = GetActionDisplay(report.Action)
        };
    }

    public async Task<ReportStatisticsDto> GetReportStatisticsAsync()
    {
        var stats = new ReportStatisticsDto
        {
            TotalQuizzes = await _context.Quizzes.CountAsync(),
            TotalAttempts = await _context.QuizAttempts.CountAsync(),
            TotalReports = await _context.QuizReports.CountAsync(),
            PendingReports = await _context.QuizReports.CountAsync(r => r.Status == ReportStatus.Pending),
            ResolvedReports = await _context.QuizReports.CountAsync(r => r.Status == ReportStatus.Resolved)
        };

        stats.ReportsByStatus = await _context.QuizReports
            .GroupBy(r => r.Status)
            .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
            .ToDictionaryAsync(x => x.Status, x => x.Count);

        stats.ActionsTaken = await _context.QuizReports
            .Where(r => r.Action.HasValue)
            .GroupBy(r => r.Action!.Value)
            .Select(g => new { Action = g.Key.ToString(), Count = g.Count() })
            .ToDictionaryAsync(x => x.Action, x => x.Count);

        return stats;
    }

    private async Task UpdatePendingReportsToResolved(int quizId, int adminId, int excludeReportId)
    {
        var pendingReports = await _context.QuizReports
            .Where(r => r.QuizId == quizId && r.Status == ReportStatus.Pending && r.Id != excludeReportId)
            .ToListAsync();

        foreach (var report in pendingReports)
        {
            report.Status = ReportStatus.Resolved;
            report.ResolvedById = adminId;
            report.ResolvedAt = DateTime.UtcNow;
            report.AdminNote = "bài quizz đã được xử lý từ một đơn báo cáo khác, cảm ơn bạn đã báo cáo";
        }
    }
}