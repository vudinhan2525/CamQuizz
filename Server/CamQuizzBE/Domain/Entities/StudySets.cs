namespace CamQuizzBE.Domain.Entities;

[Table("studysets")]
public class StudySets
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    [Required]
    public string Name { get; set; } = string.Empty;

    [Column("flashcard_number")]
    public int FlashcardNumber { get; set; } = 0;

    [Column("estimated")]
    public string Estimated { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("user_id")]
    public int UserId { get; set; }

    [ForeignKey("UserId")]
    public AppUser User { get; set; } = null!;

    public ICollection<FlashCards> FlashCards { get; set; } = new List<FlashCards>();
}
