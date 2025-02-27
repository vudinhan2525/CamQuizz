using CamQuizzBE.Applications.DTOs.Users;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Applications.Helpers;
using CamQuizzBE.Domain.Interfaces;
using System.Text.RegularExpressions;

namespace CamQuizzBE.Presentation.Controllers;

class UserMap
{
    public string? Pincode { get; set; }
    public RegisterDto? RegisterDto { get; set; }
}

public class AuthController(
    ITokenService tokenService,
    UserManager<AppUser> userManager,
    IMapper mapper
) : BaseApiController
{
    private Dictionary<string, UserMap> pincodeMap = [];
    public static bool IsValidEmail(string email)
    {
        var emailPattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
        return Regex.IsMatch(email, emailPattern);
    }
    [HttpPost("validate-signup")]
    public async Task<ActionResult<UserDto>> ValidateSignup(RegisterDto registerDto)
    {
         if (string.IsNullOrWhiteSpace(registerDto.Email) || !IsValidEmail(registerDto.Email))
        {
            return BadRequest("Email already exists.");
        }
        var result = await userManager.PasswordValidators.First().ValidateAsync(
            userManager,
            null!,
            registerDto.Password
        );

        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }
        return Ok(true);
    }

    [HttpPost("signup")]
    public async Task<ActionResult<UserDto>> Signup(RegisterDto registerDto)
    {
        if (await UserExists(registerDto.Email))
        {
            return BadRequest("Email already exists.");
        }

        var user = mapper.Map<AppUser>(registerDto);

        var result = await userManager.CreateAsync(user, registerDto.Password);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }
        else
        {
            await userManager.AddToRoleAsync(user, registerDto.Role ?? "Listener");
        }

        return mapper.Map<UserDto>(user);
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        var existingUser = await userManager.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .SingleOrDefaultAsync(x => x.NormalizedEmail == loginDto.Email.ToUpper());
        if (existingUser == null)
        {
            return Unauthorized("User with this email does not exist.");
        }

        var result = await userManager.CheckPasswordAsync(existingUser, loginDto.Password);
        if (!result) return Unauthorized("Invalid password");

        var userDto = mapper.Map<UserDto>(existingUser);
        userDto.Token = await tokenService.CreateTokenAsync(existingUser);

        return userDto;
    }
    
    [HttpGet("test-token")]
    public IActionResult TestToken(string token)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadJwtToken(token);
            return Ok(jsonToken);
        }
        catch (Exception ex)
        {
            return BadRequest($"❌ Invalid Token: {ex.Message}");
        }
    }

    private async Task<bool> UserExists(string email)
    {
        return await userManager.Users.AnyAsync(x => x.NormalizedEmail == email.ToUpper());
    }

    private static string HideEmail(string email)
    {
        var emailParts = email.Split('@');
        var emailName = emailParts[0];
        var emailDomain = emailParts[1];

        var emailNameLength = emailName.Length;
        var emailNameFirstChar = emailName[0];
        var emailNameLastChar = emailName[emailNameLength - 1];

        var hiddenEmailName = emailNameFirstChar + new string('*', emailNameLength - 2) + emailNameLastChar;

        return $"{hiddenEmailName}@{emailDomain}";
    }
}
