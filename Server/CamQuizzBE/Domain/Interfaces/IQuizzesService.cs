
namespace CamQuizzBE.Domain.Interfaces;

using System.Text.Json.Serialization;
using CamQuizzBE.Applications.DTOs.Quizzes;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Enums;

public interface IQuizzesService
{
    Task<PagedResult<Quizzes>> GetAllQuizzesAsync(string? kw, int limit, int page, string? sort, int? genreId, bool showPrivate = false);
    Task<List<Quizzes>> GetTop5Quizzes();
    Task<PagedResult<Quizzes>> GetQuizzesByUserAsync(int userId, string? kw, int limit, int page, string? sort);
    Task<Quizzes?> GetQuizByIdAsync(int id);
    Task<Quizzes?> CreateQuizAsync(CreateQuizBody body);
    Task DeleteQuizAsync(int id);

    Task<Quizzes> UpdateQuizAsync(UpdateQuizDto updateQuiz);
}
public class CreateQuizBody
{
    public required int UserId;
    public string Name { get; set; } = string.Empty;
    public string? Image { get; set; } = string.Empty;
    public int? GenreId { get; set; }
    public QuizStatus? Status { get; set; }
    public List<string> UserShareIds = new List<string>();
    public List<string> GroupShareIds = new List<string>();

    public List<CreateQuestionBody> Questions = new List<CreateQuestionBody>();
}

public class CreateQuestionBody
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("duration")]
    public int Duration { get; set; }

    [JsonPropertyName("score")]
    public int Score { get; set; }

    [JsonPropertyName("answers")]
    public List<CreateAnswerBody> Answers { get; set; } = new();
}
public class CreateAnswerBody
{
    [JsonPropertyName("answer")]
    public string Answer { get; set; } = string.Empty;

    [JsonPropertyName("is_correct")]
    public bool IsCorrect { get; set; }
}