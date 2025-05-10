using CamQuizzBE.Applications.DTOs.Quizzes;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Repositories;
using CamQuizzBE.Infras.Data;
namespace CamQuizzBE.Infras.Repositories;

public class QuizzesRepository(DataContext context) : IQuizzesRepository
{
    private readonly DataContext _context = context;

    public async Task<PagedResult<Quizzes>> GetAllAsync(string? kw, int limit, int page, string? sort, int? genreId)
    {
        var query = _context.Quizzes
            .Include(q => q.Questions)
                .ThenInclude(q => q.Answers)
            .AsQueryable();


        if (!string.IsNullOrWhiteSpace(kw))
        {
            query = query.Where(q => q.Name.Contains(kw));
        }
        if (genreId.HasValue && genreId != 0)
        {
            query = query.Where(q => q.GenreId.Equals(genreId));
        }

        if (!string.IsNullOrWhiteSpace(sort))
        {
            bool isDescending = sort.StartsWith("-");
            string sortField = isDescending ? sort.Substring(1) : sort;

            query = sortField.ToLower() switch
            {
                "name" => isDescending ? query.OrderByDescending(q => q.Name) : query.OrderBy(q => q.Name),
                "created_at" => isDescending ? query.OrderByDescending(q => q.CreatedAt) : query.OrderBy(q => q.CreatedAt),
                "question_num" => isDescending ? query.OrderByDescending(q => q.NumberOfQuestions) : query.OrderBy(q => q.NumberOfQuestions),
                "anttend_num" => isDescending ? query.OrderByDescending(q => q.NumberOfAttended) : query.OrderBy(q => q.NumberOfAttended),
                _ => query.OrderBy(q => q.Id) // Default sorting by Id
            };
        }

        int totalItems = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync();


        return new PagedResult<Quizzes>(items, totalItems, page, limit);
    }
    public async Task<Quizzes?> GetByIdAsync(int id)
    {
        return await _context.Quizzes
            .Include(q => q.Questions)
                .ThenInclude(q => q.Answers)
            .FirstOrDefaultAsync(q => q.Id == id);
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

    public async Task UpdateAsync(Quizzes quiz)
    {
        _context.Quizzes.Update(quiz);
        await _context.SaveChangesAsync();
    }

    public async Task IncrementQuestionCountAsync(int quizId)
    {
        await _context.Database.ExecuteSqlRawAsync(
            "UPDATE quizzes SET question_nums = question_nums + 1 WHERE Id = {0}", quizId);
    }
}
