namespace CamQuizzBE.Applications.DTOs.Reports;

public class QuizHistoryDto
{
    public int QuizId { get; set; }
    public string QuizName { get; set; } = string.Empty;
    public string QuizImage { get; set; } = string.Empty;
    public int GenreId { get; set; }
    public string GenreName { get; set; } = string.Empty;
    public int AttemptCount { get; set; }
    public int BestScore { get; set; }
    public DateTime LastAttemptDate { get; set; }
}