using System.ComponentModel.DataAnnotations;

namespace CamQuizzBE.Applications.DTOs.Users;

public class UpdateUserDto
{
    [StringLength(50, MinimumLength = 1, ErrorMessage = "First name must be between 1 and 50 characters.")]
    public string? FirstName { get; set; }

    [StringLength(50, MinimumLength = 1, ErrorMessage = "Last name must be between 1 and 50 characters.")]
    public string? LastName { get; set; }

    [StringLength(10, ErrorMessage = "Gender must not exceed 10 characters.")]
    public string? Gender { get; set; }

    public DateOnly? DateOfBirth { get; set; }
}
