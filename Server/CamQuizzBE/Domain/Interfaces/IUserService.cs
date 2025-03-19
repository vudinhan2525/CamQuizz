using CamQuizzBE.Applications.DTOs.Users;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Applications.Helpers;
using Microsoft.AspNetCore.Identity;

namespace CamQuizzBE.Domain.Interfaces;

public interface IUserService
{
    Task<IdentityResult> CreateUserAsync(RegisterDto registerDto);
    Task<UserDto?> GetUserByIdAsync(int id);
    Task<PagedResult<UserDto>> GetUsersAsync(UserParams userParams, string? kw, int limit, int page, string? sort);

    Task<IdentityResult> UpdateUserAsync(int id, UpdateUserDto updateUserDto);
    Task<IdentityResult> DeleteUserAsync(int id);
}
