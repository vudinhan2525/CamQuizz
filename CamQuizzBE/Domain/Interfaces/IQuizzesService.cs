
namespace CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Domain.Entities;

public interface IQuizzesService
{
    Task<IEnumerable<Quizzes>> GetAllQuizzesAsync();
    Task<Quizzes?> GetQuizByIdAsync(int id);
    Task CreateQuizAsync(Quizzes quiz);
    Task DeleteQuizAsync(int id);
}
