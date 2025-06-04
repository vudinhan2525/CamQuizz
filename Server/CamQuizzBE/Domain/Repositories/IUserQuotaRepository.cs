namespace CamQuizzBE.Domain.Repositories;

using CamQuizzBE.Domain.Entities;

public interface IUserQuotaRepository
{
    Task<UserQuota> GetByUserIdAsync(int userId);
    Task AddQuotaAsync(UserQuota quota);
    Task UpdateQuotaAsync(UserQuota quota);
    
    // Add quota when user buys a package
    Task AddPackageQuotaAsync(int userId, int quizzes, int participants);
    
    // Decrease quota when user creates a quiz
    Task DecrementQuizzQuotaAsync(int userId, int participants);
    
    // Check if user has sufficient quota
    Task<bool> HasSufficientQuotaAsync(int userId, int participants);
}