using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Repositories;
using CamQuizzBE.Infras.Data;
using CamQuizzBE.Presentation.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace CamQuizzBE.Infras.Repositories;

public class UserQuotaRepository : IUserQuotaRepository
{
    private readonly DataContext _context;

    public UserQuotaRepository(DataContext context)
    {
        _context = context;
    }

    public async Task<UserQuota> GetByUserIdAsync(int userId)
    {
        var quota = await _context.Set<UserQuota>()
            .FirstOrDefaultAsync(q => q.UserId == userId);

        if (quota == null)
        {
            // Create default quota from first package
            var defaultPackage = await _context.Packages
                .OrderBy(p => p.Id)
                .FirstOrDefaultAsync();

            if (defaultPackage != null)
            {
                quota = new UserQuota
                {
                    UserId = userId,
                    TotalQuizz = defaultPackage.MaxNumberOfQuizz,
                    RemainingQuizz = defaultPackage.MaxNumberOfQuizz,
                    TotalParticipants = defaultPackage.MaxNumberOfAttended,
                    UpdatedAt = DateTime.UtcNow
                };
                await AddQuotaAsync(quota);
            }
        }
        
        return quota;
    }

    public async Task AddQuotaAsync(UserQuota quota)
    {
        await _context.Set<UserQuota>().AddAsync(quota);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateQuotaAsync(UserQuota quota)
    {
        _context.Set<UserQuota>().Update(quota);
        await _context.SaveChangesAsync();
    }

    public async Task AddPackageQuotaAsync(int userId, int quizzes, int participants)
    {
        var quota = await GetByUserIdAsync(userId);
        
        if (quota == null)
        {
            quota = new UserQuota
            {
                UserId = userId,
                TotalQuizz = quizzes,
                RemainingQuizz = quizzes,
                TotalParticipants = participants,
                UpdatedAt = DateTime.UtcNow
            };
            await AddQuotaAsync(quota);
        }
        else
        {
            quota.TotalQuizz += quizzes;
            quota.RemainingQuizz += quizzes;
            quota.TotalParticipants += participants;
            quota.UpdatedAt = DateTime.UtcNow;
            await UpdateQuotaAsync(quota);
        }
    }

    public async Task DecrementQuizzQuotaAsync(int userId, int participants)
    {
        var quota = await GetByUserIdAsync(userId);
        
        if (quota == null)
            throw new ValidatorException("No quota available for this user");

        if (quota.RemainingQuizz <= 0)
            throw new ValidatorException("No remaining quiz quota");

        if (participants > quota.TotalParticipants)
            throw new ValidatorException($"Participant limit exceeded. Maximum allowed: {quota.TotalParticipants}");

        quota.RemainingQuizz--;
        quota.UpdatedAt = DateTime.UtcNow;
        await UpdateQuotaAsync(quota);
    }

    public async Task<bool> HasSufficientQuotaAsync(int userId, int participants)
    {
        var quota = await GetByUserIdAsync(userId);
        return quota != null && 
               quota.RemainingQuizz > 0 && 
               participants <= quota.TotalParticipants;
    }
}