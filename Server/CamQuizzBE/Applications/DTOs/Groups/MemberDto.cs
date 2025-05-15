using CamQuizzBE.Domain.Enums;
namespace CamQuizzBE.Applications.DTOs.Groups;

public class MemberDto
{

    public int GroupId { get; set; }
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string DisplayName => $"{FirstName} {LastName}".Trim();
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public MemberStatus Status { get; set; } = MemberStatus.Pending;
}
