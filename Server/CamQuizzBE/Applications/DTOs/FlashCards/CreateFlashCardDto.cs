namespace CamQuizzBE.Applications.DTOs.FlashCards;

public class CreateFlashCardDto
{
    [Required]
    public int StudySetId { get; set; }

    [Required]
    [MaxLength(500)]
    public string Question { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Answer { get; set; } = string.Empty;
}
