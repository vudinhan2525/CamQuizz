namespace CamQuizzBE.Applications.DTOs.StudySets;

public class StudySetDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int UserId { get; set; }
    public List<int> FlashCardIds { get; set; } = new();
    public int FlashcardNumber { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
