namespace CamQuizzBE.Applications.DTOs.Quizzes;

public class QuestionsDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int NumberOfAnswer { get; set; } = 0;
    public string Description { get; set; } = string.Empty;
    public int Duration { get; set; } = 0;
    public int Score { get; set; } = 0;
    public int QuizId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}