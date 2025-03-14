using CamQuizzBE.Applications.DTOs.FlashCards;
namespace CamQuizzBE.Applications.DTOs.StudySets;

public class StudySetDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int UserId { get; set; }
    public List<FlashCardDto> FlashCards { get; set; }
    public int FlashcardNumber => FlashCards?.Count ?? 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
