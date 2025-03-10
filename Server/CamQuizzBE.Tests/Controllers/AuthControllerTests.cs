using AutoMapper;
using CamQuizzBE.Applications.DTOs.Users;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Presentation.Controllers;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Threading.Tasks;
using Xunit;

public class AuthControllerTests
{
    private readonly Mock<ITokenService> _tokenServiceMock;
    private readonly Mock<UserManager<AppUser>> _userManagerMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _tokenServiceMock = new Mock<ITokenService>();
        _userManagerMock = new Mock<UserManager<AppUser>>(
            Mock.Of<IUserStore<AppUser>>(),
            null, null, null, null, null, null, null, null
        );
        _mapperMock = new Mock<IMapper>();

        _controller = new AuthController(_tokenServiceMock.Object, _userManagerMock.Object, _mapperMock.Object);
    }

    [Fact]
    public async Task ValidateSignup_ReturnsBadRequest_WhenEmailIsInvalid()
    {
        // Arrange
        var registerDto = new RegisterDto { Email = "invalid-email", Password = "Password123!" };

        // Act
        var result = await _controller.ValidateSignup(registerDto) as BadRequestObjectResult;

        // Assert
        Assert.NotNull(result);
        Assert.Equal(400, result?.StatusCode);
        Assert.Equal("Email already exists.", result?.Value);
    }

    [Fact]
    public async Task Signup_ReturnsBadRequest_WhenEmailExists()
    {
        // Arrange
        var registerDto = new RegisterDto { Email = "test@example.com", Password = "Password123!" };
        _userManagerMock.Setup(x => x.Users.AnyAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<AppUser, bool>>>(), default))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.Signup(registerDto) as BadRequestObjectResult;

        // Assert
        Assert.NotNull(result);
        Assert.Equal(400, result?.StatusCode);
        Assert.Equal("Email already exists.", result?.Value);
    }

    [Fact]
    public async Task Login_ReturnsUnauthorized_WhenUserDoesNotExist()
    {
        // Arrange
        var loginDto = new LoginDto { Email = "notfound@example.com", Password = "Password123!" };
        _userManagerMock.Setup(x => x.Users.SingleOrDefaultAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<AppUser, bool>>>(), default))
            .ReturnsAsync((AppUser)null!);

        // Act
        var result = await _controller.Login(loginDto) as UnauthorizedObjectResult;

        // Assert
        Assert.NotNull(result);
        Assert.Equal(401, result?.StatusCode);
        Assert.Equal("User with this email does not exist.", result?.Value);
    }

    [Fact]
    public void TestToken_ReturnsOk_WhenTokenIsValid()
    {
        // Arrange
        var validToken = "valid.jwt.token";
        var handlerMock = new Mock<JwtSecurityTokenHandler>();
        handlerMock.Setup(h => h.ReadJwtToken(validToken)).Returns(new JwtSecurityToken());

        // Act
        var result = _controller.TestToken(validToken) as OkObjectResult;

        // Assert
        Assert.NotNull(result);
        Assert.Equal(200, result?.StatusCode);
    }
}
