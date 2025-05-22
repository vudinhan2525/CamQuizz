using System.Security.Claims;
using CamQuizzBE.Applications.DTOs.Reports;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Presentation.Exceptions;
using CamQuizzBE.Presentation.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CamQuizzBE.Presentation.Controllers;

[Route("api/v1/reports")]
[ApiController]
[Authorize]
public class ReportController : ControllerBase
{
    private readonly ILogger<ReportController> _logger;
    private readonly IReportService _reportService;

    public ReportController(ILogger<ReportController> logger, IReportService reportService)
    {
        _logger = logger;
        _reportService = reportService;
    }

    // GET: api/v1/reports/author/{quizId}
    [HttpGet("author/{quizId}")]
    public async Task<ActionResult<ApiResponse<AuthorReportDto>>> GetAuthorReport(int quizId)
    {
        try
        {
            if (quizId <= 0)
            {
                throw new ValidatorException("Invalid quiz ID. Must be greater than 0.");
            }

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var report = await _reportService.GenerateAuthorReportAsync(quizId, userId);
            if (report == null)
            {
                throw new KeyNotFoundException("Report not found.");
            }

            var response = new ApiResponse<AuthorReportDto>(report, "Author report generated successfully.");
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating author report for quiz {QuizId}", quizId);
            throw;
        }
    }

    // GET: api/v1/reports/attempt/{attemptId}
    [HttpGet("attempt/{attemptId}")]
    public async Task<ActionResult<ApiResponse<OldAttemptReportDto>>> GetOldAttemptReport(int attemptId)
    {
        try
        {
            if (attemptId <= 0)
            {
                throw new ValidatorException("Invalid attempt ID. Must be greater than 0.");
            }

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var report = await _reportService.GenerateOldAttemptReportAsync(attemptId, userId);
            if (report == null)
            {
                throw new KeyNotFoundException("Attempt report not found.");
            }

            var response = new ApiResponse<OldAttemptReportDto>(report, "Attempt report generated successfully.");
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating attempt report for attempt {AttemptId}", attemptId);
            throw;
        }
    }
}
