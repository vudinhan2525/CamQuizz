namespace CamQuizzBE.Application.DTOs;

public class CreateAnswerDto
{
    [Required]
    public string Answer { get; set; } = string.Empty;

    [Required]
    public bool IsCorrect { get; set; }

    [Required]
    public int QuestionId { get; set; }
}
