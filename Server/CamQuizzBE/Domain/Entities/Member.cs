using CamQuizzBE.Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CamQuizzBE.Domain.Entities;
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
    public MemberStatus Status { get; set; } = MemberStatus.Pending;
}
