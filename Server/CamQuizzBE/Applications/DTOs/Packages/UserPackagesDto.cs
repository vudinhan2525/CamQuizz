using CamQuizzBE.Applications.DTOs.Users;
using CamQuizzBE.Domain.Entities;

namespace CamQuizzBE.Applications.DTOs.Packages
{
    public class UserPackagesDto
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public int PackageId { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public UserDto? User { get; set; }

        public PackageDto? Package { get; set; }
    }
}
