namespace CamQuizzBE.Domain.Repositories;

using CamQuizzBE.Applications.DTOs.Quizzes;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;

public interface IQuizzesRepository
{
    Task<PagedResult<Quizzes>> GetAllAsync(string? kw, int limit, int page, string? sort, int? genreId);
    Task<Quizzes?> GetByIdAsync(int id);
    Task<Quizzes?> AddAsync(CreateQuizBody body);
    Task DeleteAsync(int id);

    Task UpdateAsync(Quizzes quiz);
    Task IncrementQuestionCountAsync(int quizId);
}
