using CamQuizzBE.Domain.Enums;

namespace CamQuizzBE.Applications.DTOs.Groups;

public class UpdateMemberStatusDto
{
    public MemberStatus Status { get; set; }
}