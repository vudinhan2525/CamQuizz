namespace CamQuizzBE.Applications.DTOs.StudySets;


public class CreateStudySetDto
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;


    [Required]
    public int UserId { get; set; }
}
