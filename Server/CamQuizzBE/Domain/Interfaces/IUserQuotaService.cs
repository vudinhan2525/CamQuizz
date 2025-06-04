using CamQuizzBE.Domain.Entities;

namespace CamQuizzBE.Domain.Interfaces;

public interface IUserQuotaService
{
    Task<UserQuota?> GetUserQuotaAsync(int userId);
    Task<UserQuota> GetDefaultQuotaAsync(int userId);
}