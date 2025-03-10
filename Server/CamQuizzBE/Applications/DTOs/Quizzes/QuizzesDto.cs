namespace CamQuizzBE.Applications.DTOs.Quizzes;

public class QuizzesDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public int Duration { get; set; } = 0;
    public int NumberOfQuestions { get; set; } = 0;
    public string Description { get; set; } = string.Empty;
    public int GenreId { get; set; }
    public int UserId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
