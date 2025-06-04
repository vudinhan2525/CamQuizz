// Infrastructure/Services/QuizzesService.cs
using CamQuizzBE.Applications.DTOs.Quizzes;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Domain.Repositories;

namespace CamQuizzBE.Applications.Services;

public class QuizzesService : IQuizzesService
{
    private readonly IConfiguration _config;
    private readonly IQuizzesRepository _quizzesRepo;
    private readonly IUserService _userService;
    private readonly IUserQuotaRepository _userQuotaRepo;
    private readonly IUserRepository _userRepository;
    private readonly IGroupRepository _groupRepository;

    public QuizzesService(
        IConfiguration config,
        IQuizzesRepository quizzesRepo,
        IUserService userService,
        IUserQuotaRepository userQuotaRepo,
        IUserRepository userRepository,
        IGroupRepository groupRepository)
    {
        _config = config;
        _quizzesRepo = quizzesRepo;
        _userService = userService;
        _userQuotaRepo = userQuotaRepo;
        _userRepository = userRepository;
        _groupRepository = groupRepository;
    }

    public async Task<PagedResult<Quizzes>> GetAllQuizzesAsync(string? kw, int limit, int page, string? sort, int? genreId, bool showPrivate = false)
    {
        return await _quizzesRepo.GetAllAsync(kw, limit, page, sort, genreId, showPrivate);
    }

    public async Task<List<Quizzes>> GetTop5Quizzes()
    {
        return await _quizzesRepo.GetTop5();
    }


    public async Task<PagedResult<Quizzes>> GetQuizzesByUserAsync(int userId, string? kw, int limit, int page, string? sort)
    {
        return await _quizzesRepo.GetByUserIdAsync(userId, kw, limit, page, sort);
    }

    public async Task<Quizzes?> GetQuizByIdAsync(int id)
    {
        return await _quizzesRepo.GetByIdAsync(id);
    }

    public async Task<Quizzes?> CreateQuizAsync(CreateQuizBody body)
    {
        var (isAllowed, message) = await _userService.CheckUserRule(body.UserId);

        if (!isAllowed)
        {
            throw new UnauthorizedAccessException(message);
        }

        Quizzes? quiz = null;
        try
        {
            // First create the quiz
            quiz = await _quizzesRepo.AddAsync(body);
            
            // Then decrement the quota
            await _userQuotaRepo.DecrementQuizzQuotaAsync(body.UserId, 0); // 0 participants for new quiz

            // Handle email-based sharing
            if (body.UserEmails?.Any() == true)
            {
                foreach (var email in body.UserEmails)
                {
                    var targetUser = await _userRepository.GetUserByEmailAsync(email);
                    if (targetUser != null && !await _quizzesRepo.IsQuizSharedWithUserAsync(quiz.Id, targetUser.Id))
                    {
                        await _quizzesRepo.ShareQuizWithUserAsync(new UserShared
                        {
                            QuizId = quiz.Id,
                            OwnerId = body.UserId,
                            UserId = targetUser.Id
                        });
                    }
                }
            }

            // Handle group sharing
            if (body.GroupShareIds?.Any() == true)
            {
                foreach (var groupId in body.GroupShareIds)
                {
                    if (int.TryParse(groupId, out int gId))
                    {
                        await _quizzesRepo.ShareQuizWithGroupAsync(new GroupShared
                        {
                            QuizId = quiz.Id,
                            OwnerId = body.UserId,
                            GroupId = gId
                        });
                    }
                }
            }
        }
        catch (Exception)
        {
            // If quota decrement fails or sharing fails, we should delete the created quiz
            if (quiz != null)
            {
                await _quizzesRepo.DeleteAsync(quiz.Id);
            }
            throw; // Re-throw the exception after cleanup
        }
        
        // Get a fresh copy of the quiz with all relationships
        return await _quizzesRepo.GetByIdAsync(quiz.Id);
    }

    public async Task DeleteQuizAsync(int id)
    {
        var quiz = await _quizzesRepo.GetByIdAsync(id);
        if (quiz == null)
        {
            throw new KeyNotFoundException("Quiz not found.");
        }
        await _quizzesRepo.DeleteAsync(id);
    }

    public async Task<Quizzes> UpdateQuizAsync(UpdateQuizDto updateQuiz)
    {
        var existingQuiz = await _quizzesRepo.GetByIdAsync(updateQuiz.Id);
        if (existingQuiz == null)
        {
            throw new KeyNotFoundException("Quiz not found.");
        }

        // Update properties
        existingQuiz.Name = updateQuiz.Name ?? existingQuiz.Name;
        existingQuiz.Image = updateQuiz.Image ?? existingQuiz.Image;
        existingQuiz.GenreId = updateQuiz.GenreId ?? existingQuiz.GenreId;
        existingQuiz.Status = updateQuiz.Status ?? existingQuiz.Status;
        existingQuiz.UpdatedAt = DateTime.UtcNow;

        await _quizzesRepo.UpdateAsync(existingQuiz);
        return existingQuiz;
    }

    public async Task<ShareQuizByEmailResponse> ShareQuizByEmailAsync(ShareQuizByEmailDto request)
    {
        // Verify quiz exists and owner is correct
        var quiz = await _quizzesRepo.GetByIdAsync(request.QuizId);
        if (quiz == null)
        {
            return new ShareQuizByEmailResponse
            {
                Success = false,
                Message = "Quiz not found"
            };
        }

        if (quiz.UserId != request.OwnerId)
        {
            return new ShareQuizByEmailResponse
            {
                Success = false,
                Message = "Not authorized to share this quiz"
            };
        }

        // Find user by email
        var targetUser = await _userRepository.GetUserByEmailAsync(request.Email);
        if (targetUser == null)
        {
            return new ShareQuizByEmailResponse
            {
                Success = false,
                Message = "User with provided email not found"
            };
        }

        // Check if already shared
        var alreadyShared = await _quizzesRepo.IsQuizSharedWithUserAsync(request.QuizId, targetUser.Id);
        if (alreadyShared)
        {
            return new ShareQuizByEmailResponse
            {
                Success = false,
                Message = "Quiz already shared with this user"
            };
        }

        // Create sharing record
        await _quizzesRepo.ShareQuizWithUserAsync(new UserShared
        {
            QuizId = request.QuizId,
            OwnerId = request.OwnerId,
            UserId = targetUser.Id
        });

        return new ShareQuizByEmailResponse
        {
            Success = true,
            Message = "Quiz shared successfully"
        };
    }
}
