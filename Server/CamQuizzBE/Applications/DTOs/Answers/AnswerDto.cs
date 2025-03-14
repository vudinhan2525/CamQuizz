namespace CamQuizzBE.Applications.DTOs.Answers;

public class AnswerDto
{
    public int Id { get; set; }
    public string Answer { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int QuestionId { get; set; }
}
