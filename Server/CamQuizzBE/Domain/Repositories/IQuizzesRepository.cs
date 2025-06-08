namespace CamQuizzBE.Domain.Repositories;

using CamQuizzBE.Applications.DTOs.Quizzes;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;

public interface IQuizzesRepository
{
    Task<PagedResult<Quizzes>> GetAllAsync(string? kw, int limit, int page, string? sort, int? genreId, bool showPrivate = false);
    Task<List<Quizzes>> GetTop5();
    Task<PagedResult<Quizzes>> GetByUserIdAsync(int userId, string? kw, int limit, int page, string? sort);
    Task<PagedResult<Quizzes>> GetSharedWithUserAsync(int userId, string? kw, int limit, int page, string? sort);
    Task<Quizzes?> GetByIdAsync(int id);
    Task<Quizzes?> AddAsync(CreateQuizBody body);
    Task DeleteAsync(int id);

    Task UpdateAsync(Quizzes quiz);
    Task IncrementQuestionCountAsync(int quizId);
    Task<bool> IsQuizSharedWithUserAsync(int quizId, int userId);
    Task ShareQuizWithUserAsync(UserShared userShared);
    Task ShareQuizWithGroupAsync(GroupShared groupShared);
    Task RemoveAllSharedUsersAsync(int quizId);
    Task RemoveAllSharedGroupsAsync(int quizId);
    Task RemoveSharedUserAsync(int quizId, int userId);
    Task RemoveSharedGroupAsync(int quizId, int groupId);
}
