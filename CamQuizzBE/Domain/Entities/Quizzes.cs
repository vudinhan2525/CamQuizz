namespace CamQuizzBE.Domain.Entities;

public class Quizzes
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Property
    // public List<Questions> Questions { get; set; } = new();
}
