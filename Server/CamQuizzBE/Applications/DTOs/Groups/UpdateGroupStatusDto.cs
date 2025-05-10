using CamQuizzBE.Domain.Enums;
namespace CamQuizzBE.Applications.DTOs.Groups;

public class UpdateGroupStatusDto
{
    public GroupStatus Status { get; set; }
}