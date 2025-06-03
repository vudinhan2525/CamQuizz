namespace CamQuizzBE.Domain.Entities;

[Table("user_packages")]
public class UserPackages
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("package_id")]
    public int PackageId { get; set; }

    public AppUser User { get; set; }
    public Packages Package { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

}
