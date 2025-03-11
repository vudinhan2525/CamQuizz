using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CamQuizzBE.Domain.Entities;

[Table("flashcards")]
public class FlashCard
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("question")]
    [Required]
    public string Question { get; set; } = string.Empty;

    [Column("answer")]
    [Required]
    public string Answer { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("studyset_id")]
    public int StudySetId { get; set; }

    [ForeignKey("StudySetId")]
    public StudySet StudySet { get; set; } = null!;
}
