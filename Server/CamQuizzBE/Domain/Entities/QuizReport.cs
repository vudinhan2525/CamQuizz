using CamQuizzBE.Domain.Enums;

namespace CamQuizzBE.Domain.Entities;

public class QuizReport
{
    public int Id { get; set; }
    public int QuizId { get; set; }
    public int ReporterId { get; set; }
    public string Message { get; set; } = string.Empty;
    public ReportStatus Status { get; set; }
    public QuizReportAction? Action { get; set; }
    public string? AdminNote { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public int? ResolvedById { get; set; }

    // Navigation properties
    public Quizzes Quiz { get; set; } = null!;
    public AppUser Reporter { get; set; } = null!;
    public AppUser? ResolvedBy { get; set; }
}