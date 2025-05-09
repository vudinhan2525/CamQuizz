using System.Collections.Generic;

namespace CamQuizzBE.Applications.DTOs.Questions;



public class GameQuestionOption
{
    public required string Label { get; set; }  // A, B, C, D
    public required string Content { get; set; }
}
public class GameQuestionResponse
{
    public int Id { get; set; }
    public required string Content { get; set; }
    public int TimeLimit { get; set; }
    public List<GameQuestionOption> Options { get; set; } = new();
}