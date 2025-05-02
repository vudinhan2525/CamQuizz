using CamQuizzBE.Domain.Enums;
namespace CamQuizzBE.Applications.DTOs.Groups;

public class MemberDto
{

    public int GroupId { get; set; }
    public int UserId { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public MemberStatus Status { get; set; } = MemberStatus.Pending;
}
