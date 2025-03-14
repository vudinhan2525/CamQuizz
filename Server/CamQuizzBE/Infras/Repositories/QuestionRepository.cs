using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Repositories;
using CamQuizzBE.Infras.Data;

namespace CamQuizzBE.Infras.Repositories;

public class QuestionsRepository(DataContext context) : IQuestionRepository
{
    private readonly DataContext _context = context;

    public async Task<PagedResult<Questions>> GetAllAsync(string? kw, int limit, int page, string? sort, int? quizId)
    {
        var query = _context.Questions.AsQueryable();

        if (!string.IsNullOrWhiteSpace(kw))
        {
            query = query.Where(q => q.Name.Contains(kw));
        }

        if (quizId.HasValue)
        {
            query = query.Where(q => q.QuizId == quizId);
        }

        if (!string.IsNullOrWhiteSpace(sort))
        {
            bool isDescending = sort.StartsWith("-");
            string sortField = isDescending ? sort.Substring(1) : sort;

            query = sortField.ToLower() switch
            {
                "name" => isDescending ? query.OrderByDescending(q => q.Name) : query.OrderBy(q => q.Name),
                "created_at" => isDescending ? query.OrderByDescending(q => q.CreatedAt) : query.OrderBy(q => q.CreatedAt),
                _ => query.OrderBy(q => q.Id) // Default sorting by Id
            };
        }

        int totalItems = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync();

        return new PagedResult<Questions>(items, totalItems, page, limit);
    }

    public async Task<Questions?> GetByIdAsync(int id)
    {
        return await _context.Questions.Include(q => q.Answers).FirstOrDefaultAsync(q => q.Id == id);
    }

    public async Task<Questions> AddAsync(Questions question)
    {
        await _context.Questions.AddAsync(question);
        await _context.SaveChangesAsync();

        return question;
    }

    public async Task DeleteAsync(int id)
    {
        var question = await GetByIdAsync(id);
        if (question != null)
        {
            _context.Questions.Remove(question);
            await _context.SaveChangesAsync();
        }
    }
}
