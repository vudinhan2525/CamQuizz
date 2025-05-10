namespace CamQuizzBE.Applications.DTOs.FlashCards;

public class UpdateFlashCardDto
{
    [Required]
    public int StudySetId { get; set; }
    public int Id { get; set; }
    [Required]
    [MaxLength(500)]
    public string Question { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Answer { get; set; } = string.Empty;
}
