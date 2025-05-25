using CamQuizzBE.Applications.DTOs.Users;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Applications.Helpers;
using CamQuizzBE.Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;
using AutoMapper;

namespace CamQuizzBE.Applications.Services;

public class UserService(
    IUserRepository userRepository,
    IMapper mapper,
    UserManager<AppUser> userManager,
    ILogger<UserService> logger
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

    public async Task<UserDto?> GetUserByEmailAsync(string email)
    {
        var user = await userRepository.GetUserByEmailAsync(email);
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
        try
        {
            logger.LogInformation("UpdateUserAsync called with id: {Id}, updateData: {@UpdateData}", id, updateUserDto);

            var user = await userRepository.GetUserByIdAsync(id);
            if (user == null)
            {
                logger.LogWarning("User with id {Id} not found", id);
                return IdentityResult.Failed(new IdentityError { Description = "User not found" });
            }

            logger.LogInformation("User found: {Email}, mapping update data", user.Email);

            // Log before mapping
            logger.LogInformation("Before mapping - User: FirstName={FirstName}, LastName={LastName}, Gender={Gender}, DateOfBirth={DateOfBirth}",
                user.FirstName, user.LastName, user.Gender, user.DateOfBirth);

            mapper.Map(updateUserDto, user);
            user.UpdatedAt = DateTime.UtcNow;

            // Log after mapping
            logger.LogInformation("After mapping - User: FirstName={FirstName}, LastName={LastName}, Gender={Gender}, DateOfBirth={DateOfBirth}",
                user.FirstName, user.LastName, user.Gender, user.DateOfBirth);

            var result = await userRepository.UpdateUserAsync(user);

            if (result.Succeeded)
            {
                logger.LogInformation("User {Id} updated successfully", id);
            }
            else
            {
                logger.LogError("Failed to update user {Id}. Errors: {Errors}", id, string.Join(", ", result.Errors.Select(e => e.Description)));
            }

            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Exception occurred while updating user {Id}", id);
            throw;
        }
    }

    public async Task<IdentityResult> DeleteUserAsync(int id)
    {
        var user = await userRepository.GetUserByIdAsync(id);
        if (user == null) return IdentityResult.Failed(new IdentityError { Description = "User not found" });

        return await userRepository.DeleteUserAsync(user);
    }

    public async Task<IdentityResult> BanUserAsync(int id, bool isBanned)
    {
        var user = await userRepository.GetUserByIdAsync(id);
        if (user == null) return IdentityResult.Failed(new IdentityError { Description = "User not found" });

        user.IsBanned = isBanned;
        user.UpdatedAt = DateTime.UtcNow;

        return await userRepository.UpdateUserAsync(user);
    }

    public async Task<IdentityResult> ChangePasswordAsync(int id, string currentPassword, string newPassword)
    {
        var user = await userRepository.GetUserByIdAsync(id);
        if (user == null)
            return IdentityResult.Failed(new IdentityError { Description = "User not found" });

        var result = await userManager.ChangePasswordAsync(user, currentPassword, newPassword);
        if (result.Succeeded)
        {
            user.UpdatedAt = DateTime.UtcNow;
            await userRepository.UpdateUserAsync(user);
        }

        return result;
    }

    // public async Task<UserDto?> HandleExternalLoginAsync(GoogleUserInfo userInfo)
    // {
    //     var user = await userManager.FindByEmailAsync(userInfo.Email);

    //     if (user == null)
    //     {
    //         // Create new user with required fields
    //         user = new AppUser
    //         {
    //             UserName = userInfo.Email,
    //             Email = userInfo.Email,
    //             FirstName = userInfo.GivenName,
    //             LastName = userInfo.FamilyName,
    //             Gender = "Other",  // Default value since Google doesn't provide gender
    //             CreatedAt = DateTime.UtcNow,
    //             UpdatedAt = DateTime.UtcNow
    //         };

    //         var result = await userManager.CreateAsync(user);
    //         if (!result.Succeeded)
    //             return null;

    //         // Add to Student role by default
    //         await userManager.AddToRoleAsync(user, "Student");

    //         // Add Google login info
    //         await userManager.AddLoginAsync(user,
    //             new UserLoginInfo("Google", userInfo.Sub, "Google"));
    //     }
    //     else
    //     {
    //         // Update existing user's info if needed
    //         user.FirstName = userInfo.GivenName;
    //         user.LastName = userInfo.FamilyName;
    //         user.UpdatedAt = DateTime.UtcNow;

    //         await userManager.UpdateAsync(user);

    //         // Update Google login info if needed
    //         var existingLogins = await userManager.GetLoginsAsync(user);
    //         if (!existingLogins.Any(l => l.LoginProvider == "Google" && l.ProviderKey == userInfo.Sub))
    //         {
    //             await userManager.AddLoginAsync(user,
    //                 new UserLoginInfo("Google", userInfo.Sub, "Google"));
    //         }
    //     }

    //     return mapper.Map<UserDto>(user);
    // }
}
