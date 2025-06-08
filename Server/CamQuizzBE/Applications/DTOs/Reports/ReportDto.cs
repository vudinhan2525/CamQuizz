namespace CamQuizzBE.Applications.DTOs.Reports;

public class AuthorReportDto
{
    public int TotalAttempts { get; set; }
    public int TotalGroupSessions { get; set; }
    public List<QuestionStatsDto> QuestionStats { get; set; } = new();
    public Dictionary<int, int> ScoreDistribution { get; set; } = new();
}

public class QuestionStatsDto
{
    public int QuestionId { get; set; }
    public string QuestionName { get; set; } = string.Empty;
    public double AverageAnswerTime { get; set; }
    public List<OptionStatsDto> OptionStats { get; set; } = new();
}

public class OptionStatsDto
{
    public int AnswerId { get; set; }
    public string AnswerText { get; set; } = string.Empty;
    public double SelectionRate { get; set; } // Percentage (0-100)
}

public class OldAttemptReportDto
{
    public int AttemptNumber { get; set; }
    public DateTime Timestamp { get; set; }
    public int Score { get; set; }
    public TimeSpan? Duration { get; set; }
    public string? RoomId { get; set; }  // For hosted sessions
    
    // Quiz information
    public int QuizId { get; set; }
    public string QuizName { get; set; } = string.Empty;
    public string QuizImage { get; set; } = string.Empty;
    public int GenreId { get; set; }
    public string GenreName { get; set; } = string.Empty;
    public int TotalQuestions { get; set; }
    public int TotalCorrect { get; set; }
    public double AccuracyRate { get; set; }
    
    public List<QuestionReviewDto> QuestionReviews { get; set; } = new();
}

public class QuestionReviewDto
{
    public int QuestionId { get; set; }
    public string QuestionName { get; set; } = string.Empty;
    public List<SelectedAnswerDto> SelectedAnswers { get; set; } = new();
    public List<SelectedAnswerDto> CorrectAnswers { get; set; } = new();
}

public class SelectedAnswerDto
{
    public int AnswerId { get; set; }
    public string AnswerText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
}