using CamQuizzBE.Applications.DTOs.Quizzes;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Enums;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Domain.Repositories;
using CamQuizzBE.Infras.Data;
namespace CamQuizzBE.Infras.Repositories;

public class QuizzesRepository(
    DataContext context,
    ILogger<QuizzesRepository> logger,
    IQuestionRepository questionRepo,
    IAnswerRepository answerRepo) : IQuizzesRepository
{
    private readonly DataContext _context = context;
    private readonly IQuestionRepository _questionRepo = questionRepo;
    private readonly IAnswerRepository _answerRepo = answerRepo;
    private readonly ILogger<QuizzesRepository> _logger = logger;

    public async Task<PagedResult<Quizzes>> GetAllAsync(string? kw, int limit, int page, string? sort, int? genreId, bool showPrivate = false)
    {
        var query = _context.Quizzes
            .Include(q => q.Questions)
                .ThenInclude(q => q.Answers)
            .Include(q => q.SharedUsers)
                .ThenInclude(us => us.User)
            .Include(q => q.SharedGroups)
                .ThenInclude(gs => gs.Group)
            .Where(q => !q.IsDeleted)
            .AsQueryable();

        // Filter by status if not admin
        if (!showPrivate)
        {
            query = query.Where(q => q.Status == QuizStatus.Public);
        }


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
    public async Task<List<Quizzes>> GetTop5()
    {
        var top5Quizzes = await _context.Quizzes
            .Where(q => !q.IsDeleted)
            .OrderByDescending(q => q.NumberOfAttended)
            .Take(5)
            .ToListAsync();

        return top5Quizzes;
    }
    public async Task<PagedResult<Quizzes>> GetByUserIdAsync(int userId, string? kw, int limit, int page, string? sort)
    {
        var query = _context.Quizzes
            .Include(q => q.Questions)
                .ThenInclude(q => q.Answers)
            .Include(q => q.SharedUsers)
                .ThenInclude(us => us.User)
            .Include(q => q.SharedGroups)
                .ThenInclude(gs => gs.Group)
            .Where(q => q.UserId == userId && !q.IsDeleted)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(kw))
        {
            query = query.Where(q => q.Name.Contains(kw));
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
                _ => query.OrderBy(q => q.Id)
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
        var quiz = await _context.Quizzes
        .Include(q => q.Questions)
            .ThenInclude(q => q.Answers)  
        .Include(q => q.SharedUsers)
            .ThenInclude(us => us.User)
        .Include(q => q.SharedUsers)
            .ThenInclude(us => us.Owner)
        .Include(q => q.SharedGroups)
            .ThenInclude(gs => gs.Group)
        .Include(q => q.SharedGroups)
            .ThenInclude(gs => gs.Owner)
            .AsSplitQuery() 
            .FirstOrDefaultAsync(q => q.Id == id);  

        return quiz;
    }

    public async Task<Quizzes?> AddAsync(CreateQuizBody body)
    {
        if (body.GenreId is null || body.GenreId <= 0)
        {
            throw new ArgumentException("GenreId must be greater than 0.", nameof(body.GenreId));
        }

        var quiz = new Quizzes
        {
            UserId = body.UserId,
            Name = body.Name,
            Image = body.Image,
            GenreId = (int)body.GenreId,
            Status = body.Status ?? QuizStatus.Public,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            SharedUsers = new List<UserShared>(),
            SharedGroups = new List<GroupShared>()
        };
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // First create and save the quiz to get an ID
            if (quiz == null)
            {
                throw new ArgumentNullException(nameof(quiz));
            }
            await _context.Quizzes.AddAsync(quiz);
            await _context.SaveChangesAsync();

            int totalDuration = 0;
            int questionCount = 0;

            // Process questions if provided
            if (body.Questions != null && body.Questions.Any())
            {
                foreach (var questionBody in body.Questions)
                {
                    var question = new Questions
                    {
                        QuizId = quiz.Id,
                        Name = questionBody.Name,
                        Description = questionBody.Description,
                        Duration = questionBody.Duration,
                        Score = questionBody.Score
                    };

                    await _questionRepo.AddAsync(question);
                    totalDuration += questionBody.Duration;
                    questionCount++;

                    foreach (var answerBody in questionBody.Answers)
                    {
                        var answer = new Answers
                        {
                            QuestionId = question.Id,
                            Answer = answerBody.Answer,
                            IsCorrect = answerBody.IsCorrect
                        };
                        await _answerRepo.AddAsync(answer);
                    }
                }
            }

            // Update quiz duration and question count
            quiz.Duration = totalDuration;
            quiz.NumberOfQuestions = questionCount;
            quiz.UpdatedAt = DateTime.UtcNow;

            // Share with users
            if (body.UserEmails != null && body.UserEmails.Any())
            {
                foreach (var email in body.UserEmails)
                {
                    var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
                    if (user != null)
                    {
                        var userShared = new UserShared
                        {
                            QuizId = quiz.Id,
                            UserId = user.Id,
                            OwnerId = body.UserId,
                            Quiz = quiz,
                            User = user
                        };
                        quiz.SharedUsers.Add(userShared);
                    }
                    else
                    {
                        _logger.LogWarning("User with email {Email} not found for sharing quiz {QuizId}", email, quiz.Id);
                    }
                }
            }

            // Share with groups
            if (body.GroupShareIds != null && body.GroupShareIds.Any())
            {
                foreach (var groupId in body.GroupShareIds)
                {
                    if (int.TryParse(groupId, out int parsedGroupId))
                    {
                        var group = await _context.Groups.FindAsync(parsedGroupId);
                        if (group != null)
                        {
                            var groupShared = new GroupShared
                            {
                                QuizId = quiz.Id,
                                GroupId = parsedGroupId,
                                OwnerId = body.UserId,
                                Quiz = quiz,
                                Group = group
                            };
                            quiz.SharedGroups.Add(groupShared);
                        }
                    }
                    else
                    {
                        _logger.LogWarning("Invalid GroupId {GroupId} for sharing quiz {QuizId}", groupId, quiz.Id);
                    }
                }
            }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return await GetByIdAsync(quiz.Id);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error occurred while creating quiz");
                throw;
            }
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

    public async Task<bool> IsQuizSharedWithUserAsync(int quizId, int userId)
    {
        return await _context.UserShared
            .AnyAsync(us => us.QuizId == quizId && us.UserId == userId);
    }

    public async Task ShareQuizWithUserAsync(UserShared userShared)
    {
        var quiz = await _context.Quizzes
            .Include(q => q.SharedUsers)
                .ThenInclude(us => us.User)
            .FirstOrDefaultAsync(q => q.Id == userShared.QuizId);

        if (quiz != null)
        {
            var user = await _context.Users.FindAsync(userShared.UserId);
            var owner = await _context.Users.FindAsync(userShared.OwnerId);
            
            if (user != null && owner != null)
            {
                userShared.User = user;
                userShared.Owner = owner;
                userShared.Quiz = quiz;

                quiz.SharedUsers.Add(userShared);
                await _context.SaveChangesAsync();
            }
        }
    }

    public async Task ShareQuizWithGroupAsync(GroupShared groupShared)
    {
        var quiz = await _context.Quizzes
            .Include(q => q.SharedGroups)
                .ThenInclude(gs => gs.Group)
            .FirstOrDefaultAsync(q => q.Id == groupShared.QuizId);

        if (quiz != null)
        {
            var group = await _context.Groups.FindAsync(groupShared.GroupId);
            var owner = await _context.Users.FindAsync(groupShared.OwnerId);
            
            if (group != null && owner != null)
            {
                groupShared.Group = group;
                groupShared.Owner = owner;
                groupShared.Quiz = quiz;

                quiz.SharedGroups.Add(groupShared);
                await _context.SaveChangesAsync();
            }
        }
    }
}
