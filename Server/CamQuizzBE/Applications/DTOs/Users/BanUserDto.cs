using System.ComponentModel.DataAnnotations;

namespace CamQuizzBE.Applications.DTOs.Users;

public class BanUserDto
{
    [Required]
    public bool IsBanned { get; set; }  
}