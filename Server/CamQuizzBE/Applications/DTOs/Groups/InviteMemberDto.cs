using System.ComponentModel.DataAnnotations;

namespace CamQuizzBE.Applications.DTOs.Groups;

public class InviteMemberDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}