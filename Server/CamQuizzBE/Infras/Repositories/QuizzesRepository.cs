using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Repositories;
using CamQuizzBE.Infras.Data;

namespace CamQuizzBE.Infras.Repositories;

public class QuizzesRepository(DataContext context) : IQuizzesRepository
{
    private readonly DataContext _context = context;

    public async Task<IEnumerable<Quizzes>> GetAllAsync()
    {
        return await _context.Quizzes.ToListAsync();
    }

    public async Task<Quizzes?> GetByIdAsync(int id)
    {
        return await _context.Quizzes.FirstOrDefaultAsync(q => q.Id == id);
    }

    public async Task AddAsync(Quizzes quiz)
    {
        await _context.Quizzes.AddAsync(quiz);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var quiz = await GetByIdAsync(id);
        if (quiz != null)
        {
            _context.Quizzes.Remove(quiz);
            await _context.SaveChangesAsync();
        }
    }
}
