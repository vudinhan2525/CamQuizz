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

    public async Task<Answers> AddAsync(Answers answer)
    {
        await _context.Answers.AddAsync(answer);
        await _context.SaveChangesAsync();
        return answer;
    }

    public async Task DeleteAsync(int id)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var answer = await GetByIdAsync(id);
            if (answer != null)
            {
                _context.Answers.Remove(answer);
                await _context.SaveChangesAsync();
                await _context.Database.ExecuteSqlRawAsync(
                    "UPDATE questions SET answer_number = answer_number - 1 WHERE Id = {0} AND answer_number > 0",
                    answer.QuestionId);
            }

            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
    public async Task UpdateAsync(Answers answer)
    {
        _context.Answers.Update(answer);
        await _context.SaveChangesAsync();
    }
}
