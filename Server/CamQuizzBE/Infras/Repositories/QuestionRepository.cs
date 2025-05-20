using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Repositories;
using CamQuizzBE.Infras.Data;

namespace CamQuizzBE.Infras.Repositories;

public class QuestionsRepository(DataContext context, ILogger<QuestionsRepository> logger) : IQuestionRepository
{
    private readonly DataContext _context = context;
    private readonly ILogger<QuestionsRepository> _logger = logger;

    public async Task<PagedResult<Questions>> GetAllAsync(string? kw, int limit, int page, string? sort, int? quizId)
    {
        var query = _context.Questions
        .Include(q => q.Answers)
        .AsQueryable();

        if (!string.IsNullOrWhiteSpace(kw))
        {
            query = query.Where(q => q.Name.Contains(kw));
        }

        if (quizId.HasValue && quizId.Value != 0)
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
        _logger.LogInformation(">>>>comehere");
        await _context.Questions.AddAsync(question);
        await _context.SaveChangesAsync();

        return question;
    }

    public async Task DeleteAsync(int id)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var question = await GetByIdAsync(id);
            if (question != null)
            {
                _context.Questions.Remove(question);
                await _context.SaveChangesAsync();
                await _context.Database.ExecuteSqlRawAsync(
                    "UPDATE quizzes SET question_nums = question_nums - 1 WHERE Id = {0} AND question_nums > 0",
                    question.QuizId);
            }

            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
    public async Task UpdateAsync(Questions question)
    {
        _context.Questions.Update(question);
        await _context.SaveChangesAsync();
    }
    public async Task IncrementAnswerCountAsync(int questionId)
    {
        await _context.Database.ExecuteSqlRawAsync(
            "UPDATE questions SET answer_number = answer_number + 1 WHERE Id = {0}", questionId);
    }
}
