using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CamQuizzBE.Domain.Entities;

[Table("studysets")]
public class StudySet
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

    // Use HashSet instead of List for better performance
    public ICollection<FlashCard> FlashCards { get; set; } = new HashSet<FlashCard>();
}
