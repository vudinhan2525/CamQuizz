
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
    Task<PagedResult<Quizzes>> GetSharedQuizzesAsync(int userId, string? kw, int limit, int page, string? sort);
    Task<Quizzes?> GetQuizByIdAsync(int id);
    Task<Quizzes?> CreateQuizAsync(CreateQuizBody body);
    Task DeleteQuizAsync(int id);

    Task<Quizzes> UpdateQuizAsync(UpdateQuizDto updateQuiz);
    Task<ShareQuizByEmailResponse> ShareQuizByEmailAsync(ShareQuizByEmailDto request);
}
public class CreateQuizBody
{
    [JsonPropertyName("user_id")]
    public required int UserId;
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
    
    [JsonPropertyName("image")]
    public string? Image { get; set; } = string.Empty;
    
    [JsonPropertyName("genre_id")]
    public int? GenreId { get; set; }
    
    [JsonPropertyName("status")]
    public QuizStatus? Status { get; set; }

    [JsonPropertyName("duration")]
    public int Duration { get; set; }

    [JsonPropertyName("question_nums")]
    public int NumberOfQuestions { get; set; }

    [JsonPropertyName("attended_nums")]
    public int NumberOfAttended { get; set; }
    
    [JsonPropertyName("shared_users")]
    public List<string> UserEmails = new List<string>();
    
    [JsonPropertyName("shared_groups")]
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