using CamQuizzBE.Applications.DTOs.Users;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Applications.Helpers;
using CamQuizzBE.Domain.Interfaces;
using System.Text.RegularExpressions;
using System.Security.Claims;
// using System.IdentityModel.Tokens.Jwt;
// using Microsoft.AspNetCore.Authentication;
// using Microsoft.AspNetCore.Authentication.Cookies;
// using Microsoft.AspNetCore.Authentication.Google;

namespace CamQuizzBE.Presentation.Controllers;

class UserMap
{
    public string? Pincode { get; set; }
    public RegisterDto? RegisterDto { get; set; }
}
[Route("api/v1/auth")]
[ApiController]
public class AuthController(
    ITokenService tokenService,
    UserManager<AppUser> userManager,
    IMapper mapper,
    IUserService userService
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
            await userManager.AddToRoleAsync(user, registerDto.Role ?? "Student");
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
   [HttpPut("{id}")]
   [Authorize]
   public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto updateUserDto)
   {
       var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
       
       // Check if user is trying to update their own account or is admin
       if (currentUserId != id && !User.IsInRole("Admin"))
       {
           return Unauthorized("You can only update your own account");
       }

       var result = await userService.UpdateUserAsync(id, updateUserDto);
       if (!result.Succeeded) return BadRequest(result.Errors);
       return Ok("User updated successfully");
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        // Check if user is trying to delete their own account or is admin
        if (currentUserId != id && !User.IsInRole("Admin"))
        {
            return Unauthorized("You can only delete your own account");
        }

        var result = await userService.DeleteUserAsync(id);
        if (!result.Succeeded) return BadRequest(result.Errors);
        return Ok("User deleted successfully");
    }
    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetUserById(int id)
    {
        Console.WriteLine($"🔍 AuthController.GetUserById called with id: {id}");
        var user = await userService.GetUserByIdAsync(id);
        if (user == null) return NotFound("User not found");

        var userDto = mapper.Map<UserDto>(user);
        Console.WriteLine($"📤 Returning user data: FirstName={userDto.FirstName}, LastName={userDto.LastName}");
        return Ok(userDto);
    }

    [HttpGet("test-debug")]
    public IActionResult TestDebug()
    {
        Console.WriteLine("🧪 TEST DEBUG ENDPOINT CALLED");
        return Ok("Debug endpoint working");
    }

    [HttpPut("test-put/{id}")]
    public IActionResult TestPut(int id, [FromBody] object data)
    {
        Console.WriteLine($"🧪 TEST PUT ENDPOINT CALLED with id: {id}");
        Console.WriteLine($"🧪 Data received: {data}");
        return Ok($"Test PUT successful for id: {id}");
    }
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllUser(
        [FromQuery] string? kw,
        [FromQuery] int limit = 10,
        [FromQuery] int page = 1,
        [FromQuery] string? sort = null)
    {
        var userParams = new UserParams();
        var users = await userService.GetUsersAsync(userParams, kw, limit, page, sort);
        return Ok(users);
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var result = await userService.ChangePasswordAsync(userId, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok("Password changed successfully");
    }

    // [HttpGet("external-login/google")]
    // public IActionResult GoogleLogin()
    // {
    //     var properties = new AuthenticationProperties
    //     {
    //         RedirectUri = Url.Action(nameof(ExternalLoginCallback), "Auth", null, Request.Scheme)
    //     };

    //     return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    // }

    // [HttpGet("external-login/callback")]
    // public async Task<IActionResult> ExternalLoginCallback()
    // {
    // try
    // {
    //     var info = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
    //     if (info?.Principal == null)
    //         return BadRequest("External authentication failed");

    //     var userInfo = new GoogleUserInfo
    //     {
    //         Email = info.Principal.FindFirstValue(ClaimTypes.Email) ?? "",
    //         GivenName = info.Principal.FindFirstValue(ClaimTypes.GivenName) ?? "",
    //         FamilyName = info.Principal.FindFirstValue(ClaimTypes.Surname) ?? "",
    //         Sub = info.Principal.FindFirstValue(ClaimTypes.NameIdentifier) ?? ""
    //     };

    //     // Validate required fields
    //     if (string.IsNullOrEmpty(userInfo.Email) ||
    //         string.IsNullOrEmpty(userInfo.Sub) ||
    //         string.IsNullOrEmpty(userInfo.GivenName) ||
    //         string.IsNullOrEmpty(userInfo.FamilyName))
    //     {
    //         return BadRequest("Required user information not provided by Google");
    //     }

    //     var user = await userManager.FindByEmailAsync(userInfo.Email);

    //     if (user == null)
    //     {
    //         user = new AppUser
    //         {
    //             UserName = userInfo.Email,
    //             Email = userInfo.Email,
    //             FirstName = userInfo.GivenName,
    //             LastName = userInfo.FamilyName,
    //             Gender = "Other",  // Default value as required by your model
    //             CreatedAt = DateTime.UtcNow,
    //             UpdatedAt = DateTime.UtcNow
    //         };

    //         var createResult = await userManager.CreateAsync(user);
    //         if (!createResult.Succeeded)
    //             return BadRequest(createResult.Errors);

    //         await userManager.AddToRoleAsync(user, "Student");  // Default role
    //     }

    //     // Add Google login info if not already present
    //     var existingLogins = await userManager.GetLoginsAsync(user);
    //     if (!existingLogins.Any(l => l.LoginProvider == "Google" && l.ProviderKey == userInfo.Sub))
    //     {
    //         var addLoginResult = await userManager.AddLoginAsync(user,
    //             new UserLoginInfo("Google", userInfo.Sub, "Google"));

    //         if (!addLoginResult.Succeeded)
    //             return BadRequest("Failed to link Google account");
    //     }

    //     // Return user with token as per your existing pattern
    //     var userDto = mapper.Map<UserDto>(user);
    //     userDto.Token = await tokenService.CreateTokenAsync(user);

    //     return Ok(userDto);
    // }
    // catch (Exception ex)
    // {
    //     Console.WriteLine($"Google authentication error: {ex.Message}");
    //     return BadRequest("An error occurred during Google authentication");
    // }
    // }

    [HttpGet("email/{email}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserDto>> GetUserByEmail(string email)
    {
        var user = await userService.GetUserByEmailAsync(email);
        if (user == null) return NotFound("User not found");
        return Ok(user);
    }

    [HttpPut("{id}/ban")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> BanUser(int id, BanUserDto banUserDto)
    {
        var result = await userService.BanUserAsync(id, banUserDto.IsBanned);
        if (!result.Succeeded) return BadRequest(result.Errors);

        return Ok($"User has been {(banUserDto.IsBanned ? "banned" : "unbanned")} successfully");
    }



}

