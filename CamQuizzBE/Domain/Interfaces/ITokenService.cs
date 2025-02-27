using CamQuizzBE.Domain.Entities;

namespace CamQuizzBE.Domain.Interfaces;

public interface ITokenService
{
    Task<string> CreateTokenAsync(AppUser user);
}
