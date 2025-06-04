
public class CreatePackageDto
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    [Range(0, int.MaxValue)]
    public int Price { get; set; }

    [Required]
    public int MaxNumberOfQuizz { get; set; }

    [Required]
    public int MaxNumberOfAttended { get; set; }

}
