using CamQuizzBE.Domain.Enums;
namespace CamQuizzBE.Domain.Entities;


[Table("groups")]
public class Group
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    [Required]
    public string Name { get; set; } = string.Empty;

    [Column("description")]
    public string Description { get; set; } = string.Empty;

    [Column("owner_id")]
    public int OwnerId { get; set; }
    [Column("created_at")]
    [ForeignKey("OwnerId")]
    public AppUser Owner { get; set; } = null!;
    [Column("status")]
    public GroupStatus Status { get; set; } = GroupStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Member> Members { get; set; } = new List<Member>();

}
