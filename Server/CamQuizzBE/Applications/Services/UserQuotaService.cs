using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using CamQuizzBE.Infras.Data;

namespace CamQuizzBE.Applications.Services;

public class UserQuotaService(
    IUserQuotaRepository userQuotaRepository,
    DataContext context) : IUserQuotaService
{
    public async Task<UserQuota?> GetUserQuotaAsync(int userId)
    {
        return await userQuotaRepository.GetByUserIdAsync(userId);
    }

    public async Task<UserQuota> GetDefaultQuotaAsync(int userId)
    {
        var quota = await userQuotaRepository.GetByUserIdAsync(userId);
        if (quota != null)
            return quota;

        // Get default package (first package, usually free package)
        var defaultPackage = await context.Packages
            .OrderBy(p => p.Id)
            .FirstOrDefaultAsync();

        if (defaultPackage == null)
            throw new Exception("No default package found");

        var newQuota = new UserQuota
        {
            UserId = userId,
            RemainingQuizz = defaultPackage.MaxNumberOfQuizz,
            TotalQuizz = defaultPackage.MaxNumberOfQuizz,
            TotalParticipants = defaultPackage.MaxNumberOfAttended,
            UpdatedAt = DateTime.UtcNow
        };

        await userQuotaRepository.AddQuotaAsync(newQuota);
        return newQuota;
    }
}