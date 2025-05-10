namespace CamQuizzBE.Applications.DTOs.Questions;

public class GameQuestionResponse
{
    public int Id { get; set; }
    public required string Content { get; set; }
    public required List<GameQuestionOption> Options { get; set; }
    public int TimeLimit { get; set; }
}