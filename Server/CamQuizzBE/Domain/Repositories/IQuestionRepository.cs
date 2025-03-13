namespace CamQuizzBE.Domain.Repositories;
using CamQuizzBE.Domain.Entities;

public interface IQuestionRepository
{
    Task<PagedResult<Questions>> GetAllAsync(string? kw, int limit, int page, string? sort, int? quizId);
    Task<Questions?> GetByIdAsync(int id);
    Task AddAsync(Questions question);
    Task DeleteAsync(int id);
}
