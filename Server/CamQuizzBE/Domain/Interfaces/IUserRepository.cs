using CamQuizzBE.Applications.DTOs.Users;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Applications.Helpers;

namespace CamQuizzBE.Domain.Interfaces;

public interface IUserRepository
{
    Task<IdentityResult> ChangePasswordAsync(AppUser user, ChangePasswordDto changePasswordDto);
    Task<bool> CheckPasswordAsync(AppUser user, string password);
    Task<IdentityResult> CreateUserAsync(RegisterDto registerDto);
    Task<AppUser?> GetUserByEmailAsync(string email);
    Task<AppUser?> GetUserByIdAsync(int id);
    Task<PagedResult<UserDto>> GetUsersAsync(UserParams userParams, string? kw, int limit, int page, string? sort);

    Task<IdentityResult> UpdateUserAsync(AppUser user);
    Task<IdentityResult> DeleteUserAsync(AppUser user);

    Task<(bool, string)> CheckUserRule(int userId);

}
