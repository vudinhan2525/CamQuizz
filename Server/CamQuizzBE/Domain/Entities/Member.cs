namespace CamQuizzBE.Domain.Entities;
public enum MembershipStatus
{
    Pending,
    Approved,
    Rejected
}
[Table("members")]
public class Member
{
    [Key]
    [Column("group_id", Order = 1)]
    public int GroupId { get; set; }

    [Key]
    [Column("user_id", Order = 2)]
    public int UserId { get; set; }

    [ForeignKey("GroupId")]
    public Group Group { get; set; } = null!;

    [ForeignKey("UserId")]
    public AppUser User { get; set; } = null!;

    [Column("joined_at")]
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    [Column("status")]
    public MembershipStatus Status { get; set; } = MembershipStatus.Pending;
}
