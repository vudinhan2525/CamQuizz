
namespace CamQuizzBE.Domain.Entities;

public class AppUser : IdentityUser<int>
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Gender { get; set; }

    public DateOnly DateOfBirth { get; set; } = new DateOnly(2000, 1, 1);
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public bool IsBanned { get; set; } = false;
    public ICollection<AppUserRole> UserRoles { get; set; } = [];
    public ICollection<Quizzes> Quizzes { get; set; } = [];

    public ICollection<Member> Members { get; set; } = new List<Member>();
    public ICollection<StudySet> StudySets { get; set; } = new HashSet<StudySet>();
    public ICollection<UserPackages> UserPackages { get; set; } = new List<UserPackages>();
    public ICollection<RevenueRecords> RevenueRecords { get; set; } = new List<RevenueRecords>();
    public UserQuota Quota { get; set; }
}