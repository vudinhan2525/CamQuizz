
using System.Text.Json.Serialization;
using CamQuizzBE.Domain.Enums;
using CamQuizzBE.Domain.Interfaces;

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

    public QuizStatus Status { get; set; } = QuizStatus.Public;
    public List<string> UserShareIds = new List<string>();
    public List<string> GroupShareIds = new List<string>();

    [JsonPropertyName("questions")]
    public List<CreateQuestionBody> Questions { get; set; } = new List<CreateQuestionBody>();

}

