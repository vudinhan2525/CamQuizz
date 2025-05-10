namespace CamQuizzBE.Domain.Repositories;

using CamQuizzBE.Applications.DTOs.Quizzes;
using CamQuizzBE.Domain.Entities;

public interface IQuizzesRepository
{
    Task<PagedResult<Quizzes>> GetAllAsync(string? kw, int limit, int page, string? sort, int? genreId);
    Task<Quizzes?> GetByIdAsync(int id);
    Task AddAsync(Quizzes quiz);
    Task DeleteAsync(int id);

    Task UpdateAsync(Quizzes quiz);
    Task IncrementQuestionCountAsync(int quizId);
}
