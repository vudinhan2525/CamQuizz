using CamQuizzBE.Domain.Entities;

[Table("revenue_records")]
public class RevenueRecords
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    [Required]
    public int UserId { get; set; }

    [Column("package_id")]
    [Required]
    public int PackageId { get; set; }

    public AppUser User { get; set; }
    public Packages Package { get; set; }

    [Column("amount")]
    [Required]
    public decimal Amount { get; set; }

    [Column("date")]
    [Required]
    public DateTime Date { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}