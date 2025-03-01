namespace CamQuizzBE.Domain.Entities;

[Table("quizzes")]
public class Quizzes
{
    [Column("quiz_id")]

    public int Id { get; set; }

    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [Column("description")]
    public string Description { get; set; } = string.Empty;

    [Column("is_published")]
    public bool IsPublished { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Property
    // public List<Questions> Questions { get; set; } = new();
}
