using System.Collections.Generic;
using CamQuizzBE.Applications.DTOs.Quizzes;

namespace CamQuizzBE.Applications.DTOs.Questions;

public class QuestionResultResponse
{
    public required string RoomId { get; set; }
    public int QuizId { get; set; }
    public int QuestionId { get; set; }
    public required List<string> TrueAnswer { get; set; }  // List of correct option labels (e.g., ["A", "C"])
    public required List<PlayerScore> Ranking { get; set; }
    public GameQuestionResponse? NextQuestion { get; set; }
    
}