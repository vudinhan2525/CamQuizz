using System.Collections.Generic;
using CamQuizzBE.Applications.DTOs.Questions; // Add this line

namespace CamQuizzBE.Applications.DTOs.Quizzes
{
    public class StartGameRequest
    {
        public required string RoomId { get; set; }
    }

    public class SubmitAnswerRequest
    {
        public required string RoomId { get; set; }
        public int QuizId { get; set; }
        public int QuestionId { get; set; }
        public int UserId { get; set; }
        public required List<string> Answer { get; set; }
    }

    public class GameQuestionDto
    {
        public int Id { get; set; }
        public required string Content { get; set; }
        public required List<GameQuestionOption> Options { get; set; }
        public int TimeLimit { get; set; }
    }

    public class PlayerScore
    {
        public int UserId { get; set; }
        public required string Name { get; set; }
        public int Score { get; set; }
    }

    public class QuestionResultDto
    {
        public required string RoomId { get; set; }
        public int QuizId { get; set; }
        public int QuestionId { get; set; }
        public required List<string> TrueAnswer { get; set; }
        public required List<PlayerScore> Ranking { get; set; }
        public GameQuestionDto NextQuestion { get; set; }
    }
}