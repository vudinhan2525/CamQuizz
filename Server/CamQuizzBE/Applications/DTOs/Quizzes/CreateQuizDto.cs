
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

    [JsonPropertyName("duration")]
    public int Duration { get; set; }

    [JsonPropertyName("question_nums")]
    public int NumberOfQuestions { get; set; }

    [JsonPropertyName("attended_nums")]
    public int NumberOfAttended { get; set; }
    
    [JsonPropertyName("shared_users")]
    public List<string> UserEmails { get; set; } = new List<string>();
    
    [JsonPropertyName("shared_groups")]
    public List<string> GroupShareIds { get; set; } = new List<string>();

    [JsonPropertyName("questions")]
    public List<CreateQuestionBody> Questions { get; set; } = new List<CreateQuestionBody>();

}

