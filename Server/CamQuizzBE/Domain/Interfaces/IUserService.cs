using CamQuizzBE.Applications.DTOs.Users;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Applications.Helpers;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication;

namespace CamQuizzBE.Domain.Interfaces;

public interface IUserService
{
    Task<IdentityResult> CreateUserAsync(RegisterDto registerDto);
    Task<UserDto?> GetUserByIdAsync(int id);
    Task<UserDto?> GetUserByEmailAsync(string email);
    Task<PagedResult<UserDto>> GetUsersAsync(UserParams userParams, string? kw, int limit, int page, string? sort);

    Task<IdentityResult> UpdateUserAsync(int id, UpdateUserDto updateUserDto);
    Task<IdentityResult> DeleteUserAsync(int id);
    Task<IdentityResult> BanUserAsync(int id, bool isBanned);
    Task<IdentityResult> ChangePasswordAsync(int id, string currentPassword, string newPassword);

    Task<(bool, string)> CheckUserRule(int userId);
    // Task<UserDto?> HandleExternalLoginAsync(GoogleUserInfo userInfo);
}
