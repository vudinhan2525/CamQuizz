using CamQuizzBE.Applications.DTOs.Users;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Applications.Helpers;
using CamQuizzBE.Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using AutoMapper;

namespace CamQuizzBE.Applications.Services;

public class UserService(
    IUserRepository userRepository,
    IMapper mapper
) : IUserService
{
    public async Task<IdentityResult> CreateUserAsync(RegisterDto RegisterDto)
    {
        return await userRepository.CreateUserAsync(RegisterDto);
    }

    public async Task<UserDto?> GetUserByIdAsync(int id)
    {
        var user = await userRepository.GetUserByIdAsync(id);
        return user == null ? null : mapper.Map<UserDto>(user);
    }

    public async Task<PagedResult<UserDto>> GetUsersAsync(UserParams userParams, string? kw, int limit, int page, string? sort)
    {
        var usersPagedList = await userRepository.GetUsersAsync(userParams, kw, limit, page, sort);

        return new PagedResult<UserDto>(
            usersPagedList.Items,
            usersPagedList.TotalItems,
            usersPagedList.Page,
            usersPagedList.Limit
        );
    }




    public async Task<IdentityResult> UpdateUserAsync(int id, UpdateUserDto updateUserDto)
    {
        var user = await userRepository.GetUserByIdAsync(id);
        if (user == null) return IdentityResult.Failed(new IdentityError { Description = "User not found" });

        mapper.Map(updateUserDto, user);
        user.UpdatedAt = DateTime.UtcNow;

        return await userRepository.UpdateUserAsync(user);
    }

    public async Task<IdentityResult> DeleteUserAsync(int id)
    {
        var user = await userRepository.GetUserByIdAsync(id);
        if (user == null) return IdentityResult.Failed(new IdentityError { Description = "User not found" });

        return await userRepository.DeleteUserAsync(user);
    }
}
