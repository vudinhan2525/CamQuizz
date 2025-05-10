using CamQuizzBE.Infras.Data;
using CamQuizzBE.Applications.DTOs.Users;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Applications.Helpers;
using CamQuizzBE.Domain.Interfaces;


namespace CamQuizzBE.Infras.Repositories;

public class UserRepository(
    UserManager<AppUser> userManager,
    DataContext context,
    IMapper mapper
) : IUserRepository
{
    public async Task<IdentityResult> ChangePasswordAsync(
        AppUser user,
        ChangePasswordDto changePasswordDto
    )
    {
        var result = await userManager.ChangePasswordAsync(
            user,
            changePasswordDto.CurrentPassword,
            changePasswordDto.NewPassword
        );

        return result;
    }

    public Task<bool> CheckPasswordAsync(AppUser user, string password)
    {
        return userManager.CheckPasswordAsync(user, password);
    }

    public async Task<IdentityResult> CreateUserAsync(RegisterDto registerDto)
    {
        var password = registerDto.Password;
        var registerUser = mapper.Map<AppUser>(registerDto);

        var result = await userManager.CreateAsync(registerUser, password);

        return result;
    }

    public async Task<AppUser?> GetUserByEmailAsync(string email)
    {
        return await userManager.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .SingleOrDefaultAsync(x => x.NormalizedEmail == email.ToUpper());
    }

    public async Task<AppUser?> GetUserByIdAsync(int id)
    {
        return await userManager.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .SingleOrDefaultAsync(u => u.Id == id);
    }

    public async Task<PagedResult<UserDto>> GetUsersAsync(UserParams userParams, string? kw, int limit, int page, string? sort)
    {
        var query = context.Users.AsQueryable();

        // Remove current user
        if (!string.IsNullOrEmpty(userParams.CurrentEmail))
        {
            var normalizedEmail = userParams.CurrentEmail?.ToUpper();
            query = query.Where(u => u.NormalizedEmail != normalizedEmail);
        }

        // Filtering
        if (!string.IsNullOrEmpty(userParams.Gender))
            query = query.Where(u => u.Gender == userParams.Gender);

        if (!string.IsNullOrEmpty(userParams.FirstName))
            query = query.Where(u => u.FirstName.Contains(userParams.FirstName));

        if (!string.IsNullOrEmpty(userParams.LastName))
            query = query.Where(u => u.LastName.Contains(userParams.LastName));

        if (!string.IsNullOrEmpty(userParams.Email))
            query = query.Where(u => u.NormalizedEmail == userParams.Email.ToUpper());

        // Keyword search
        if (!string.IsNullOrEmpty(kw))
        {
            query = query.Where(u =>
                u.FirstName!.Contains(kw) ||
                u.LastName!.Contains(kw) ||
                u.Email!.Contains(kw));
        }

        // Sorting (Handles sort parameter separately)
        query = sort switch
        {
            "email" => query.OrderBy(u => u.Email),
            "email_desc" => query.OrderByDescending(u => u.Email),
            "firstName" => query.OrderBy(u => u.FirstName),
            "firstName_desc" => query.OrderByDescending(u => u.FirstName),
            "lastName" => query.OrderBy(u => u.LastName),
            "lastName_desc" => query.OrderByDescending(u => u.LastName),
            _ => query.OrderBy(u => u.Email)
        };

        // Pagination
        var totalItems = await query.CountAsync();
        var items = await query
            .ProjectTo<UserDto>(mapper.ConfigurationProvider)
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync();

        return new PagedResult<UserDto>(items, totalItems, page, limit);
    }

    public async Task<IdentityResult> UpdateUserAsync(AppUser user)
    {
        return await userManager.UpdateAsync(user);
    }

    public async Task<IdentityResult> DeleteUserAsync(AppUser user)
    {
        return await userManager.DeleteAsync(user);
    }

}
