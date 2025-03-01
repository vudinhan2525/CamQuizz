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

    public async Task<PagedList<UserDto>> GetUsersAsync(UserParams userParams)
    {
        var query = context.Users.AsQueryable();

        // Remove current user
        query = query.Where(u => u.NormalizedEmail != userParams.CurrentEmail!.ToUpper());

        // Filter by gender
        if (userParams.Gender != null)
        {
            query = query.Where(u => u.Gender == userParams.Gender);
        }

        // Filter by first name
        if (userParams.FirstName != null)
        {
            query = query.Where(u => u.FirstName.Contains(userParams.FirstName));
        }

        // Filter by last name
        if (userParams.LastName != null)
        {
            query = query.Where(u => u.LastName.Contains(userParams.LastName));
        }

        // Filter by email
        if (userParams.Email != null)
        {
            query = query.Where(u => u.NormalizedEmail == userParams.Email.ToUpper());
        }

        // Order
        query = userParams.OrderBy switch
        {
            "email" => userParams.SortBy == "asc"
                        ? query.OrderBy(u => u.Email)
                        : query.OrderByDescending(u => u.Email),
            "firstName" => userParams.SortBy == "asc"
                        ? query.OrderBy(u => u.FirstName)
                        : query.OrderByDescending(u => u.FirstName),
            "lastName" => userParams.SortBy == "asc"
                        ? query.OrderBy(u => u.LastName)
                        : query.OrderByDescending(u => u.LastName),
            _ => query.OrderBy(u => u.Email)
        };

        return await PagedList<UserDto>.CreateAsync(
            query.ProjectTo<UserDto>(mapper.ConfigurationProvider),
            userParams.PageNumber,
            userParams.PageSize
        );
    }
}
