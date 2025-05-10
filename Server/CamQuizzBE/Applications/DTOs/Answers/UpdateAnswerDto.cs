namespace CamQuizzBE.Application.DTOs;

public class UpdateAnswerDto
{
    [Required]
    public int AnswerID { get; set; }
    public string Answer { get; set; } = string.Empty;

    public bool? IsCorrect { get; set; }

}
