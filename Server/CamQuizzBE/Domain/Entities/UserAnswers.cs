using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CamQuizzBE.Domain.Entities;

[Table("user_answers")]
public class UserAnswers
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("attempt_id")]
    [Required]
    public int AttemptId { get; set; }

    [ForeignKey("AttemptId")]
    public QuizAttempts Attempt { get; set; } = null!;

    [Column("question_id")]
    [Required]
    public int QuestionId { get; set; }

    [ForeignKey("QuestionId")]
    public Questions Question { get; set; } = null!;

    [Column("answer_id")]
    [Required]
    public int AnswerId { get; set; }

    [ForeignKey("AnswerId")]
    public Answers Answer { get; set; } = null!;

    [Column("answer_time")]
    public double? AnswerTime { get; set; }

    [Column("created_at")]
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
