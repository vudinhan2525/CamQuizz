namespace CamQuizzBE.Applications.DTOs.Quizzes;

public class AnswerQuestionDto
{
    [Required]
    public int QuestionId { get; set; }

    public List<int> AnswerSubmit { get; set; } = new List<int>();
}
