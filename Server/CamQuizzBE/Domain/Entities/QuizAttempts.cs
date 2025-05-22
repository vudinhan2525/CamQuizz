using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CamQuizzBE.Domain.Entities;

[Table("quiz_attempts")]
public class QuizAttempts
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("quiz_id")]
    [Required]
    public int QuizId { get; set; }

    [ForeignKey("QuizId")]
    public Quizzes Quiz { get; set; } = null!;

    [Column("user_id")]
    [Required]
    public int UserId { get; set; }

    [ForeignKey("UserId")]
    public AppUser User { get; set; } = null!;


    [Column("room_id")]
    public string? RoomId { get; set; }

    [Column("score")]
    [Required]
    public int Score { get; set; }

    [Column("start_time")]
    [Required]
    public DateTime StartTime { get; set; }

    [Column("end_time")]
    public DateTime? EndTime { get; set; }

    [Column("created_at")]
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<UserAnswers> UserAnswers { get; set; } = new List<UserAnswers>();
}
