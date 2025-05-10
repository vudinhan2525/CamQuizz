using CamQuizzBE.Applications.DTOs.FlashCards;
namespace CamQuizzBE.Applications.DTOs.StudySets;

public class UpdateStudySetDto
{
     [Required]
    public int Id { get; set; }
    public int? UserId { get; set; } 
    public string Name { get; set; } = string.Empty;
}
