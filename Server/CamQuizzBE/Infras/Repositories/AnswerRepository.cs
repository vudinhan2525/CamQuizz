using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Repositories;
using CamQuizzBE.Infras.Data;
namespace CamQuizzBE.Infras.Repositories;

public class AnswerRepository(DataContext context) : IAnswerRepository
{
    private readonly DataContext _context = context;

    public async Task<PagedResult<Answers>> GetAllAsync(int limit, int page, string? sort, int? questionId)
    {
        var query = _context.Answers.AsQueryable();

        if (questionId.HasValue)
        {
            query = query.Where(q => q.QuestionId == questionId);
        }

        if (!string.IsNullOrWhiteSpace(sort))
        {
            bool isDescending = sort.StartsWith("-");
            string sortField = isDescending ? sort.Substring(1) : sort;

            query = sortField.ToLower() switch
            {
                "created_at" => isDescending ? query.OrderByDescending(q => q.CreatedAt) : query.OrderBy(q => q.CreatedAt),
                _ => query.OrderBy(q => q.Id) // Default sorting by Id
            };
        }

        int totalItems = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync();

        return new PagedResult<Answers>(items, totalItems, page, limit);
    }

    public async Task<Answers?> GetByIdAsync(int id)
    {
        return await _context.Answers.FirstOrDefaultAsync(q => q.Id == id);
    }

    public async Task AddAsync(Answers answer)
    {
        await _context.Answers.AddAsync(answer);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var answer = await GetByIdAsync(id);
        if (answer != null)
        {
            _context.Answers.Remove(answer);
            await _context.SaveChangesAsync();
        }
    }
}
