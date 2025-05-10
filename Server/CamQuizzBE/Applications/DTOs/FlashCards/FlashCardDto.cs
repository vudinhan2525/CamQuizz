namespace CamQuizzBE.Applications.DTOs.FlashCards;

public class FlashCardDto
{
    public int Id { get; set; }
    public int StudySetId { get; set; }
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
