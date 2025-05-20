namespace CamQuizzBE.Applications.DTOs.Users;

public class GoogleUserInfo
{
    [Required]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    public string GivenName { get; set; } = string.Empty;  // Maps to FirstName
    
    [Required]
    public string FamilyName { get; set; } = string.Empty;  // Maps to LastName

    [Required]
    public string Sub { get; set; } = string.Empty;  // Google's unique identifier
}