namespace CamQuizzBE.Applications.DTOs.Questions;

public class GameQuestionResponse
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Explanation { get; set; }
    public required List<GameQuestionOption> Options { get; set; }
    public int TimeLimit { get; set; }
    public required string RoomId { get; set; }
}