using System.Security.Claims;
using CamQuizzBE.Applications.DTOs.Reports;
using CamQuizzBE.Domain.Enums;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Presentation.Utils;
using CamQuizzBE.Domain.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CamQuizzBE.Presentation.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/quiz-reports")]
public class QuizReportController : ControllerBase
{
    private readonly IQuizReportService _quizReportService;

    public QuizReportController(IQuizReportService quizReportService)
    {
        _quizReportService = quizReportService;
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<QuizReportDto>>> CreateReport([FromBody] CreateQuizReportDto reportDto)
    {
        try
        {
            // Get current user ID from token
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0)
            {
                return Unauthorized(new ApiResponse<QuizReportDto>(null, "User not authenticated"));
            }

            // Update reporterId from token
            reportDto.ReporterId = userId;

            await _quizReportService.CreateReportAsync(reportDto);
            return new ApiResponse<QuizReportDto>(null, "Report created successfully");
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<QuizReportDto>(null, ex.Message));
        }
    }

    [HttpGet("my-reports")]
    public async Task<ActionResult<ApiResponse<PagedResult<QuizReportDto>>>> GetUserReports(
        [FromQuery] int page = 1,
        [FromQuery] int limit = 10)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0)
            {
                return Unauthorized(new ApiResponse<List<QuizReportDto>>(null, "User not authenticated"));
            }

            var reports = await _quizReportService.GetUserReportsAsync(userId, page, limit);
            return new ApiResponse<PagedResult<QuizReportDto>>(reports, "Reports retrieved successfully");
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<PagedResult<QuizReportDto>>(null, ex.Message));
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<QuizReportDto>>>> GetReports(
        [FromQuery] string? search,
        [FromQuery] ReportStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 10)
    {
        try
        {
            var reports = await _quizReportService.GetReportsAsync(search, status, page, limit);
            return new ApiResponse<PagedResult<QuizReportDto>>(reports, "Reports retrieved successfully");
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<PagedResult<QuizReportDto>>(null, ex.Message));
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("quiz/{quizId}")]
    public async Task<ActionResult<ApiResponse<PagedResult<QuizReportDto>>>> GetReportsForQuiz(
        int quizId,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 10)
    {
        try
        {
            var reports = await _quizReportService.GetReportsForQuizAsync(quizId, page, limit);
            return new ApiResponse<PagedResult<QuizReportDto>>(reports, "Quiz reports retrieved successfully");
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<PagedResult<QuizReportDto>>(null, ex.Message));
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{reportId}")]
    public async Task<ActionResult<ApiResponse<QuizReportDto>>> UpdateReport(
        int reportId,
        [FromBody] UpdateQuizReportDto updateDto)
    {
        try
        {
            var adminId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (adminId == 0)
            {
                return Unauthorized(new ApiResponse<QuizReportDto>(null, "User not authenticated"));
            }

            updateDto.AdminId = adminId;
            var report = await _quizReportService.UpdateReportAsync(reportId, updateDto);
            return new ApiResponse<QuizReportDto>(report, "Report updated successfully");
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<QuizReportDto>(null, ex.Message));
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("statistics")]
    public async Task<ActionResult<ApiResponse<ReportStatisticsDto>>> GetStatistics()
    {
        try
        {
            var statistics = await _quizReportService.GetReportStatisticsAsync();
            return new ApiResponse<ReportStatisticsDto>(statistics, "Statistics retrieved successfully");
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<ReportStatisticsDto>(null, ex.Message));
        }
    }
}