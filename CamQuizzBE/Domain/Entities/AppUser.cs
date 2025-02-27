
namespace CamQuizzBE.Domain.Entities;

public class AppUser : IdentityUser<int>
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public string? ArtistName { get; set; }
    public required string Gender { get; set; }
    public DateOnly DateOfBirth { get; set; } = new DateOnly(2000, 1, 1);
    public string? About { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
     public ICollection<AppUserRole> UserRoles { get; set; } = [];
}