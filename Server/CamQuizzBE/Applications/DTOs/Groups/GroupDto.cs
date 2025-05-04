using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Enums;
namespace CamQuizzBE.Applications.DTOs.Groups;

public class GroupDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int OwnerId { get; set; }
    public List<int> MemberIds { get; set; } = new();
    public GroupStatus Status { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
