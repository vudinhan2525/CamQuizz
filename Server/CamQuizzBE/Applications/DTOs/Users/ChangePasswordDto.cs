namespace CamQuizzBE.Applications.DTOs.Users;

public class ChangePasswordDto
{
    [Required]
    [StringLength(50, MinimumLength = 8)]
    public required string CurrentPassword { get; set; }

    [Required]
    [StringLength(50, MinimumLength = 8)]
    public required string NewPassword { get; set; }
}
