// using AutoMapper;
// using CamQuizzBE.Applications.DTOs.Users;
// using CamQuizzBE.Domain.Entities;
// using CamQuizzBE.Domain.Interfaces;
// using CamQuizzBE.Presentation.Controllers;
// using Microsoft.AspNetCore.Identity;
// using Microsoft.AspNetCore.Mvc;
// using Moq;
// using Xunit;
// using System.Threading.Tasks;
// using System.Collections.Generic;

// public class AuthControllerTests
// {
//     private readonly Mock<ITokenService> _tokenServiceMock;
//     private readonly Mock<UserManager<AppUser>> _userManagerMock;
//     private readonly Mock<IMapper> _mapperMock;
//     private readonly Mock<IUserService> _userServiceMock;
//     private readonly AuthController _controller;

//     public AuthControllerTests()
//     {
//         _tokenServiceMock = new Mock<ITokenService>();
//         _userManagerMock = new Mock<UserManager<AppUser>>(
//             Mock.Of<IUserStore<AppUser>>(), null, null, null, null, null, null, null, null);
//         _mapperMock = new Mock<IMapper>();
//         _userServiceMock = new Mock<IUserService>();

//         _controller = new AuthController(
//             _tokenServiceMock.Object,
//             _userManagerMock.Object,
//             _mapperMock.Object,
//             _userServiceMock.Object
//         );
//     }

//     [Fact]
//     public async Task UpdateUser_Failure_ReturnsBadRequest()
//     {
//         // Arrange
//         var id = 1;
//         var updateUserDto = new UpdateUserDto();
//         var identityResult = IdentityResult.Failed(new IdentityError { Description = "Update failed" });
//         _userServiceMock.Setup(s => s.UpdateUserAsync(id, updateUserDto))
//             .ReturnsAsync(identityResult);

//         // Act
//         var result = await _controller.UpdateUser(id, updateUserDto);

//         // Assert
//         var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
//         Assert.Equal(identityResult.Errors, badRequestResult.Value);
//     }

//     [Fact]
//     public async Task UpdateUser_Success_ReturnsOk()
//     {
//         // Arrange
//         var id = 1;
//         var updateUserDto = new UpdateUserDto();
//         var identityResult = IdentityResult.Success;
//         _userServiceMock.Setup(s => s.UpdateUserAsync(id, updateUserDto))
//             .ReturnsAsync(identityResult);

//         // Act
//         var result = await _controller.UpdateUser(id, updateUserDto);

//         // Assert
//         var okResult = Assert.IsType<OkObjectResult>(result);
//         Assert.Equal("User updated successfully", okResult.Value);
//     }

//     [Fact]
//     public async Task DeleteUser_Failure_ReturnsBadRequest()
//     {
//         // Arrange
//         var id = 1;
//         var identityResult = IdentityResult.Failed(new IdentityError { Description = "Delete failed" });
//         _userServiceMock.Setup(s => s.DeleteUserAsync(id))
//             .ReturnsAsync(identityResult);

//         // Act
//         var result = await _controller.DeleteUser(id);

//         // Assert
//         var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
//         Assert.Equal(identityResult.Errors, badRequestResult.Value);
//     }

//     [Fact]
//     public async Task DeleteUser_Success_ReturnsOk()
//     {
//         // Arrange
//         var id = 1;
//         var identityResult = IdentityResult.Success;
//         _userServiceMock.Setup(s => s.DeleteUserAsync(id))
//             .ReturnsAsync(identityResult);

//         // Act
//         var result = await _controller.DeleteUser(id);

//         // Assert
//         var okResult = Assert.IsType<OkObjectResult>(result);
//         Assert.Equal("User deleted successfully", okResult.Value);
//     }

//     [Fact]
//     public async Task GetUserById_UserNotFound_ReturnsNotFound()
//     {
//         // Arrange
//         var id = 1;
//         _userServiceMock.Setup(s => s.GetUserByIdAsync(id))
//             .ReturnsAsync((AppUser)null!);

//         // Act
//         var result = await _controller.GetUserById(id);

//         // Assert
//         var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
//         Assert.Equal("User not found", notFoundResult.Value);
//     }

//     [Fact]
//     public async Task GetUserById_Success_ReturnsUserDto()
//     {
//         // Arrange
//         var id = 1;
//         var appUser = new AppUser { Id = id, Email = "test@example.com" };
//         var userDto = new UserDto { Email = "test@example.com" };
//         _userServiceMock.Setup(s => s.GetUserByIdAsync(id))
//             .ReturnsAsync(appUser);
//         _mapperMock.Setup(m => m.Map<UserDto>(appUser))
//             .Returns(userDto);

//         // Act
//         var result = await _controller.GetUserById(id);

//         // Assert
//         var okResult = Assert.IsType<OkObjectResult>(result);
//         Assert.Equal(userDto, okResult.Value);
//     }

//     [Fact]
//     public async Task GetAllUser_Success_ReturnsUsers()
//     {
//         // Arrange
//         var kw = "test";
//         var limit = 10;
//         var page = 1;
//         var sort = "email";
//         var userParams = new UserParams();
//         var users = new List<AppUser> { new AppUser { Email = "test@example.com" } };
//         _userServiceMock.Setup(s => s.GetUsersAsync(userParams, kw, limit, page, sort))
//             .ReturnsAsync(users);

//         // Act
//         var result = await _controller.GetAllUser(kw, limit, page, sort);

//         // Assert
//         var okResult = Assert.IsType<OkObjectResult>(result);
//         Assert.Equal(users, okResult.Value);
//     }

//     [Fact]
//     public async Task GetAllUser_DefaultParams_ReturnsUsers()
//     {
//         // Arrange
//         var userParams = new UserParams();
//         var users = new List<AppUser> { new AppUser { Email = "default@example.com" } };
//         _userServiceMock.Setup(s => s.GetUsersAsync(userParams, null, 10, 1, null))
//             .ReturnsAsync(users);

//         // Act
//         var result = await _controller.GetAllUser(null);

//         // Assert
//         var okResult = Assert.IsType<OkObjectResult>(result);
//         Assert.Equal(users, okResult.Value);
//     }
// }