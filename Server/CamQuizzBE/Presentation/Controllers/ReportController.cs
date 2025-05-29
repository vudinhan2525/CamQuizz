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

    // GET: api/v1/reports/my-attempts
    [HttpGet("my-attempts")]
    public async Task<ActionResult<ApiResponse<List<OldAttemptReportDto>>>> GetMyAttempts(
        [FromQuery] int limit = 10,
        [FromQuery] int page = 1,
        [FromQuery] string? sort = "attempt_date")
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var response = await _reportService.GetAttemptsByUserAsync(userId, limit, page, sort);
            return Ok(new ApiResponse<List<OldAttemptReportDto>>(response, "User attempts retrieved successfully."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user attempts");
            throw;
        }
    }

    // GET: api/v1/reports/my-quiz-history
    [HttpGet("my-quiz-history")]
    public async Task<ActionResult<ApiResponse<List<QuizHistoryDto>>>> GetMyQuizHistory(
        [FromQuery] int? limit = 10,
        [FromQuery] int? page = 1)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var history = await _reportService.GetMyQuizHistoryAsync(userId, limit, page);
            return Ok(new ApiResponse<List<QuizHistoryDto>>(history, "Quiz history retrieved successfully."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting quiz history");
            throw;
        }
    }

    // GET: api/v1/reports/user/{userId}/attempts
    [HttpGet("user/{userId}/attempts")]
    public async Task<ActionResult<ApiResponse<List<OldAttemptReportDto>>>> GetAttemptsByUser(
        int userId,
        [FromQuery] string? quizId = null,
        [FromQuery] int limit = 10,
        [FromQuery] int page = 1,
        [FromQuery] string? sort = "attempt_date")
    {
        try
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            // Check if user is trying to access their own attempts or is admin
            if (currentUserId != userId && !User.IsInRole("Admin"))
            {
                return Unauthorized("You can only access your own attempts");
            }

            var response = await _reportService.GetAttemptsByUserAsync(userId, limit, page, sort);
            return Ok(new ApiResponse<List<OldAttemptReportDto>>(response, "User attempts retrieved successfully."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user attempts for user {UserId}", userId);
            throw;
        }
    }

    // GET: api/v1/reports/quiz/{quizId}/attempts
    [HttpGet("quiz/{quizId}/attempts")]
    public async Task<ActionResult<ApiResponse<List<OldAttemptReportDto>>>> GetUserAttempts(int quizId)
    {
        try
        {
            if (quizId <= 0)
            {
                throw new ValidatorException("Invalid quiz ID. Must be greater than 0.");
            }

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            _logger.LogInformation("Getting attempts for user {UserId} on quiz {QuizId}", userId, quizId);
            
            var attempts = await _reportService.GetUserAttemptsAsync(userId, quizId);
            if (attempts == null)
            {
                throw new KeyNotFoundException("No attempts found.");
            }

            var response = new ApiResponse<List<OldAttemptReportDto>>(attempts, "User attempts retrieved successfully.");
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user attempts for quiz {QuizId}", quizId);
            throw;
        }
    }
}
