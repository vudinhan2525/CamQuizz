
namespace CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Domain.Entities;

public interface IQuizzesService
{
    Task<PagedResult<Quizzes>> GetAllQuizzesAsync(string? kw, int limit, int page, string? sort, int? genreId);
    Task<Quizzes?> GetQuizByIdAsync(int id);
    Task CreateQuizAsync(Quizzes quiz);
    Task DeleteQuizAsync(int id);
}
