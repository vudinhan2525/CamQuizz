namespace CamQuizzBE.Domain.Entities;

[Table("packages")]
public class Packages
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    [Required]
    public string Name { get; set; } = string.Empty;

    [Column("max_number_of_quizz")]
    [Required]
    public int MaxNumberOfQuizz { get; set; }

    [Column("max_number_of_attended")]
    [Required]
    public int MaxNumberOfAttended { get; set; }

    [Column("price")]
    [Required]
    public int Price { get; set; }

    [Column("start_date")]
    public DateTime StartDate { get; set; } = DateTime.UtcNow;

    [Column("end_date")]
    public DateTime EndDate { get; set; } = DateTime.UtcNow;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

}
