using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CamQuizzBE.Domain.Entities;

[Table("user_quotas")]
public class UserQuota
{
    [Key]
    [Column("user_id")]
    public int UserId { get; set; }

    [Column("remaining_quizz")]
    public int RemainingQuizz { get; set; }

    [Column("total_quizz")]
    public int TotalQuizz { get; set; }

    [Column("total_participants")]
    public int TotalParticipants { get; set; }

    public AppUser User { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}