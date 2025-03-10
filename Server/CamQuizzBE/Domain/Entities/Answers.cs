namespace CamQuizzBE.Domain.Entities;

[Table("answers")]
public class Answers
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("answer")]
    [Required]
    public string Answer { get; set; } = string.Empty;

    [Column("is_correct")]
    [Required]
    public bool IsCorrect { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Foreign Key for Quizzes
    [Column("question_id")]
    public int QuestionId { get; set; }

    [ForeignKey("QuestionId")]
    public Questions Question { get; set; } = null!;
}
