
namespace CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Domain.Entities;

public interface IQuestionsService
{
    Task<PagedResult<Questions>> GetAllQuestionsAsync(string? kw, int limit, int page, string? sort, int? quizId);
    Task<Questions?> GetQuestionByIdAsync(int id);
    Task CreateQuestionAsync(Questions question);
    Task DeleteQuestionAsync(int id);
}
