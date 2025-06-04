using System.Text.Json.Serialization;
using CamQuizzBE.Domain.Enums;

namespace CamQuizzBE.Applications.DTOs.Quizzes;

public class QuizzesDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public int Duration { get; set; } = 0;
    public int NumberOfQuestions { get; set; } = 0;
    public int NumberOfAttended { get; set; } = 0;
    public string Description { get; set; } = string.Empty;
    public int GenreId { get; set; }
    public int UserId { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public QuizStatus Status { get; set; } = QuizStatus.Public;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public List<QuestionsDto> Questions { get; set; } = new();

    [JsonPropertyName("shared_users")]
    public List<UserSharedDto> SharedUsers { get; set; } = new();

    [JsonPropertyName("shared_groups")]
    public List<GroupSharedDto> SharedGroups { get; set; } = new();
}

public class UserSharedDto
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
}

public class GroupSharedDto
{
    public int GroupId { get; set; }
    public string Name { get; set; } = string.Empty;
}
