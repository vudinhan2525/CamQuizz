namespace CamQuizzBE.Domain.Entities;

[Table("questions")]
public class Questions
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    [Required]
    public string Name { get; set; } = string.Empty;

    [Column("answer_number")]
    public int NumberOfAnswer { get; set; } = 0;

    [Column("description")]
    [Required]
    public string Description { get; set; } = string.Empty;

    [Column("duration")]
    public int Duration { get; set; } = 0;

    [Column("score")]
    public int Score { get; set; } = 0;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Foreign Key for Quizzes
    [Column("quiz_id")]
    public int QuizId { get; set; }

    [ForeignKey("QuizId")]
    public Quizzes Quiz { get; set; } = null!;


    public ICollection<Answers> Answers { get; set; } = new List<Answers>();

}
