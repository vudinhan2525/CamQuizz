using CamQuizzBE.Infras.Data;
using CamQuizzBE.Applications.DTOs.Users;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Applications.Helpers;
using CamQuizzBE.Domain.Interfaces;


namespace CamQuizzBE.Infras.Repositories;

public class UserRepository(
    UserManager<AppUser> userManager,
    DataContext context,
    IMapper mapper,
    ILogger<UserRepository> logger
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
        try
        {
            Console.WriteLine($"UserRepository.UpdateUserAsync called for user {user.Id}");
            Console.WriteLine($"User data before update: FirstName={user.FirstName}, LastName={user.LastName}, Gender={user.Gender}, DateOfBirth={user.DateOfBirth}");

            // Use UserManager to update user - it handles both context and identity updates
            Console.WriteLine($"Calling userManager.UpdateAsync...");
            var result = await userManager.UpdateAsync(user);

            Console.WriteLine($"UserManager.UpdateAsync result: Succeeded={result.Succeeded}");
            if (!result.Succeeded)
            {
                Console.WriteLine($"UserManager errors: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }

            // If UserManager update succeeded, ensure changes are saved to context
            if (result.Succeeded)
            {
                Console.WriteLine($"Calling context.SaveChangesAsync...");
                var changesSaved = await context.SaveChangesAsync();
                Console.WriteLine($"SaveChanges result: {changesSaved} entities updated");

                // Verify the update by fetching the user again
                Console.WriteLine($"Verifying update by fetching user again...");
                var verifyUser = await context.Users.FindAsync(user.Id);
                if (verifyUser != null)
                {
                    Console.WriteLine($"Verification - User in DB: FirstName={verifyUser.FirstName}, LastName={verifyUser.LastName}, Gender={verifyUser.Gender}, DateOfBirth={verifyUser.DateOfBirth}");
                }
                else
                {
                    Console.WriteLine($"Verification failed - User not found in DB");
                }
            }

            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Exception in UserRepository.UpdateUserAsync: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            throw;
        }
    }

    public async Task<IdentityResult> DeleteUserAsync(AppUser user)
    {
        return await userManager.DeleteAsync(user);
    }
    public async Task<(bool, string)> CheckUserRule(int userId)
    {
        var now = DateTime.UtcNow;

        var userPackages = await context.UserPackages
            .Include(up => up.Package)
            .Where(up => up.UserId == userId &&
                         up.Package.StartDate <= now &&
                         up.Package.EndDate >= now)
            .ToListAsync();

        int totalNumberPossibleQuiz;

        if (userPackages.Count == 0)
        {
            totalNumberPossibleQuiz = 20;
        }
        else
        {
            totalNumberPossibleQuiz = userPackages
                .Where(up => up.Package != null)
                .Sum(up => up.Package.MaxNumberOfQuizz);
        }

        var userQuizzCount = await context.Quizzes
            .CountAsync(q => q.UserId == userId);

        if (userQuizzCount >= totalNumberPossibleQuiz)
        {
            return (false, $"Bạn đã tạo tối đa số lượng bài quiz ({totalNumberPossibleQuiz}) cho phép.");
        }

        return (true, "Cho phép tạo quiz.");
    }

}
