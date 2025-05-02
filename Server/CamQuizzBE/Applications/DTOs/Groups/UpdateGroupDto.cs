using System.ComponentModel.DataAnnotations;

namespace CamQuizzBE.Applications.DTOs.Groups;

public class UpdateGroupDto
{
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string Description { get; set; } = string.Empty;
}