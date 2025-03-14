namespace CamQuizzBE.Domain.Repositories;
using CamQuizzBE.Domain.Entities;

public interface IAnswerRepository
{
    Task<PagedResult<Answers>> GetAllAsync(int limit, int page, string? sort, int? questionId);
    Task<Answers?> GetByIdAsync(int id);
    Task AddAsync(Answers answer);
    Task DeleteAsync(int id);
}
