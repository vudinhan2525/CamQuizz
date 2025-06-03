using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace CamQuizzBE.Applications.DTOs.Users;

public class UpdateUserDto
{
    [StringLength(50, MinimumLength = 1, ErrorMessage = "First name must be between 1 and 50 characters.")]
    [JsonPropertyName("first_name")]
    public string? FirstName { get; set; }

    [StringLength(50, MinimumLength = 1, ErrorMessage = "Last name must be between 1 and 50 characters.")]
    [JsonPropertyName("last_name")]
    public string? LastName { get; set; }

    [StringLength(10, ErrorMessage = "Gender must not exceed 10 characters.")]
    [JsonPropertyName("gender")]
    public string? Gender { get; set; }

    [JsonPropertyName("date_of_birth")]
    public DateOnly? DateOfBirth { get; set; }
}
