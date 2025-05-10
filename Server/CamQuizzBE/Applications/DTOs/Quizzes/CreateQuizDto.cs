
namespace CamQuizzBE.Applications.DTOs.Quizzes;

public class CreateQuizDto
{
    [Required]
    [MinLength(3, ErrorMessage = "Name must be at least 3 characters long.")]
    [MaxLength(100, ErrorMessage = "Name must not exceed 100 characters.")]
    public string Name { get; set; } = string.Empty;

    public string Image { get; set; } = string.Empty;

    [Required(ErrorMessage = "GenreId is required.")]
    public int? GenreId { get; set; }

    [Required(ErrorMessage = "UserId is required.")]
    public int? UserId { get; set; }
}

