using CamQuizzBE.Domain.Enums;

namespace CamQuizzBE.Domain.Entities;

[Table("quizzes")]
public class Quizzes
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    [Required]
    public string Name { get; set; } = string.Empty;

    [Column("images")]
    [Required]
    public string Image { get; set; } = string.Empty;

    [Column("duration")]
    public int Duration { get; set; } = 0;

    [Column("status")]
    [Required]
    public QuizStatus Status { get; set; } = QuizStatus.Public;

    [Column("attended_nums")]
    public int NumberOfAttended { get; set; } = 0;

    [Column("question_nums")]
    public int NumberOfQuestions { get; set; } = 0;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("genre_id")]
    public int GenreId { get; set; }

    [ForeignKey("GenreId")]
    public Genres Genre { get; set; } = null!;

    [Column("user_id")]
    public int UserId { get; set; }

    [ForeignKey("UserId")]
    public AppUser User { get; set; } = null!;

    public ICollection<Questions> Questions { get; set; } = new List<Questions>();
}
