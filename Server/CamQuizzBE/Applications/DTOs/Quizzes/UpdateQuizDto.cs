using System.Text.Json.Serialization;
using CamQuizzBE.Domain.Enums;

namespace CamQuizzBE.Applications.DTOs.Quizzes;

public class UpdateQuizDto
{
    [JsonPropertyName("quizz_id")]
    public int Id { get; set; }

    [JsonPropertyName("status")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public QuizStatus Status { get; set; }

    [JsonPropertyName("shared_users")]
    public List<string> SharedUsers { get; set; } = new();

    [JsonPropertyName("shared_groups")]
    public List<string> SharedGroups { get; set; } = new();
}
