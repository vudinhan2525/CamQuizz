
using CamQuizzBE.Domain.Enums;

namespace CamQuizzBE.Applications.DTOs.Quizzes;

public class UpdateQuizDto
{

    [Required]
    public int Id { get; set; }


    public string Name { get; set; } = string.Empty;

    public string Image { get; set; } = string.Empty;

    public int? GenreId { get; set; }

    public QuizStatus? Status { get; set; }

}

