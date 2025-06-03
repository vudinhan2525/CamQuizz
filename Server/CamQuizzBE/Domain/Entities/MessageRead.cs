using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CamQuizzBE.Domain.Entities;

[Table("message_reads")]
public class MessageRead
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("message_id")]
    public int MessageId { get; set; }

    [ForeignKey("MessageId")]
    public ChatMessage Message { get; set; } = null!;

    [Column("user_id")]
    public int UserId { get; set; }

    [ForeignKey("UserId")]
    public AppUser User { get; set; } = null!;

    [Column("read_at")]
    public DateTime ReadAt { get; set; } = DateTime.UtcNow;
}