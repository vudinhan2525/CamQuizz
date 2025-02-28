namespace CamQuizzBE.Domain.Repositories;
using CamQuizzBE.Domain.Entities;

public interface IQuizzesRepository
{
    Task<IEnumerable<Quizzes>> GetAllAsync();
    Task<Quizzes?> GetByIdAsync(int id);
    Task AddAsync(Quizzes quiz);
    Task DeleteAsync(int id);
}
