// Infrastructure/Services/QuizzesService.cs
using CamQuizzBE.Applications.DTOs.Quizzes;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Domain.Repositories;
using CamQuizzBE.Domain.Enums;

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

    public async Task<PagedResult<Quizzes>> GetSharedQuizzesAsync(int userId, string? kw, int limit, int page, string? sort)
    {
        return await _quizzesRepo.GetSharedWithUserAsync(userId, kw, limit, page, sort);
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
            // Create quiz and handle sharing within repository
            quiz = await _quizzesRepo.AddAsync(body);
            
            // Decrement quota after successful creation
            await _userQuotaRepo.DecrementQuizzQuotaAsync(body.UserId, 0); // 0 participants for new quiz
        }
        catch (Exception)
        {
            if (quiz != null)
            {
                await _quizzesRepo.DeleteAsync(quiz.Id);
            }
            throw;
        }
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

        // Check if status is being changed to Private
        if (existingQuiz.Status != QuizStatus.Private && updateQuiz.Status == QuizStatus.Private)
        {
            await _quizzesRepo.RemoveAllSharedUsersAsync(updateQuiz.Id);
            await _quizzesRepo.RemoveAllSharedGroupsAsync(updateQuiz.Id);
        }

        // Only update properties if they are provided in the request
        if (!string.IsNullOrEmpty(updateQuiz.Name))
        {
            existingQuiz.Name = updateQuiz.Name;
        }
        if (!string.IsNullOrEmpty(updateQuiz.Image))
        {
            existingQuiz.Image = updateQuiz.Image;
        }
        if (updateQuiz.GenreId.HasValue)
        {
            existingQuiz.GenreId = updateQuiz.GenreId.Value;
        }
        if (updateQuiz.Status != existingQuiz.Status)
        {
            existingQuiz.Status = updateQuiz.Status;
        }
        if (updateQuiz.Duration.HasValue)
        {
            existingQuiz.Duration = updateQuiz.Duration.Value;
        }
        existingQuiz.UpdatedAt = DateTime.UtcNow;

        // Update quiz in database
        await _quizzesRepo.UpdateAsync(existingQuiz);

        // Only update shared users if they are provided in the request
        if (updateQuiz.SharedUsers != null)
        {
            // Remove users that are no longer in the shared list
            var currentSharedUsers = existingQuiz.SharedUsers.ToList();
            foreach (var sharedUser in currentSharedUsers)
            {
                var user = await _userService.GetUserByIdAsync(sharedUser.UserId);
                if (user?.Email != null && !updateQuiz.SharedUsers.Contains(user.Email))
                {
                    await _quizzesRepo.RemoveSharedUserAsync(updateQuiz.Id, sharedUser.UserId);
                }
            }

            // Add new shared users
            foreach (var email in updateQuiz.SharedUsers)
            {
                var user = await _userRepository.GetUserByEmailAsync(email);
                if (user != null && !await _quizzesRepo.IsQuizSharedWithUserAsync(updateQuiz.Id, user.Id))
                {
                    await _quizzesRepo.ShareQuizWithUserAsync(new UserShared
                    {
                        QuizId = updateQuiz.Id,
                        OwnerId = existingQuiz.UserId,
                        UserId = user.Id
                    });
                }
            }
        }

        // Only update shared groups if they are provided in the request
        if (updateQuiz.SharedGroups != null)
        {
            // Remove groups that are no longer in the shared list
            var currentSharedGroups = existingQuiz.SharedGroups.ToList();
            foreach (var sharedGroup in currentSharedGroups)
            {
                if (!updateQuiz.SharedGroups.Contains(sharedGroup.GroupId.ToString()))
                {
                    await _quizzesRepo.RemoveSharedGroupAsync(updateQuiz.Id, sharedGroup.GroupId);
                }
            }

            // Add new shared groups
            foreach (var groupIdStr in updateQuiz.SharedGroups)
            {
                if (int.TryParse(groupIdStr, out int groupId))
                {
                    var group = await _groupRepository.GetGroupByIdAsync(groupId);
                    if (group != null && !existingQuiz.SharedGroups.Any(g => g.GroupId == groupId))
                    {
                        await _quizzesRepo.ShareQuizWithGroupAsync(new GroupShared
                        {
                            QuizId = updateQuiz.Id,
                            GroupId = groupId,
                            OwnerId = existingQuiz.UserId
                        });
                    }
                }
            }
        }

        return await _quizzesRepo.GetByIdAsync(updateQuiz.Id);
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
