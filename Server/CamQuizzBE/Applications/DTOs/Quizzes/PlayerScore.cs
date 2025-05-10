namespace CamQuizzBE.Applications.DTOs.Quizzes;

public class QuizResultResponse
{
    public required string RoomId { get; set; }
    public int QuizId { get; set; }
    public required List<PlayerScore> Ranking { get; set; }
}