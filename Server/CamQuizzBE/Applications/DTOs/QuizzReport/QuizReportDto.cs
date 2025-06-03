using System.Text.Json.Serialization;
using CamQuizzBE.Domain.Enums;

namespace CamQuizzBE.Applications.DTOs.Reports;

    public class QuizReportDto
    {
        public int Id { get; set; }
        public int QuizId { get; set; }
        public string QuizName { get; set; } = string.Empty;
        public int ReporterId { get; set; }
        public string ReporterName { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public ReportStatus Status { get; set; }
        public QuizReportAction? Action { get; set; }
        public string? AdminNote { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public string? ResolvedByName { get; set; }
        public string? ActionDisplay { get; set; }
        public int TotalReports { get; set; }
        public int PendingReports { get; set; }
        public int ResolvedReports { get; set; }
    }

    public class CreateQuizReportDto
    {
        public int QuizId { get; set; }
        public int ReporterId { get; set; }
        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;
    }

    public class UpdateQuizReportDto
    {
        public ReportStatus Status { get; set; }
        public QuizReportAction Action { get; set; }
        public string? AdminNote { get; set; }
        public int AdminId { get; set; }
    }

    public class ReportStatisticsDto
    {
        public int TotalQuizzes { get; set; }
        public int TotalAttempts { get; set; }
        public int TotalReports { get; set; }
        public int PendingReports { get; set; }
        public int ResolvedReports { get; set; }
        public Dictionary<string, int> ReportsByStatus { get; set; } = new();
        public Dictionary<string, int> ActionsTaken { get; set; } = new();
    }