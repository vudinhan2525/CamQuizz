using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CamQuizzBE.Domain.Entities;

[Table("group_quizzes")]
public class GroupQuiz
{
    [Key]
    [Column("group_id", Order = 1)]
    public int GroupId { get; set; }

    [Key]
    [Column("quiz_id", Order = 2)]
    public int QuizId { get; set; }

    [ForeignKey("GroupId")]
    public Group Group { get; set; } = null!;

    [ForeignKey("QuizId")]
    public Quizzes Quiz { get; set; } = null!;

    [Column("shared_at")]
    public DateTime SharedAt { get; set; } = DateTime.UtcNow;

    [Column("shared_by")]
    public int SharedById { get; set; }

    [ForeignKey("SharedById")]
    public AppUser SharedBy { get; set; } = null!;
}