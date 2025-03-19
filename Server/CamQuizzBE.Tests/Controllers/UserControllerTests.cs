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
// using Moq.EntityFrameworkCore; 
// public class AuthControllerTests
// {
//     private readonly Mock<ITokenService> _tokenServiceMock;
//     private readonly Mock<UserManager<AppUser>> _userManagerMock;
//     private readonly Mock<IMapper> _mapperMock;
//     private readonly Mock<IUserService> _userServiceMock;
//     private readonly AuthController _authController;

//     public AuthControllerTests()
//     {
//         _tokenServiceMock = new Mock<ITokenService>();
//         _mapperMock = new Mock<IMapper>();
//         _userServiceMock = new Mock<IUserService>();
//         _userManagerMock = GetMockUserManager(); // ✅ Use the helper function

//         _authController = new AuthController(
//             _tokenServiceMock.Object,
//             _userManagerMock.Object,
//             _mapperMock.Object,
//             _userServiceMock.Object
//         );
//     }

//     private static Mock<UserManager<AppUser>> GetMockUserManager()
//     {
//         var store = new Mock<IUserStore<AppUser>>();
//         var mock = new Mock<UserManager<AppUser>>(
//             store.Object, null, null, null, null, null, null, null, null
//         );

//         var users = new List<AppUser>
//         {
//             new AppUser { Id = 1, Email = "test@example.com", FirstName = "Test", LastName = "User", Gender = "Male" }
//         }.AsQueryable();

//         var asyncUsers = new TestAsyncEnumerable<AppUser>(users);
        
//         mock.Setup(x => x.Users).Returns(asyncUsers);

//         return mock;
//     }


//     [Fact]
//     public async Task Signup_ReturnsCreatedAtAction_WhenModelIsValid()
//     {
//         // Arrange
//         var registerDto = new RegisterDto { Email = "test@example.com", Password = "Test@123" };
//         var userEntity = new AppUser 
//         { 
//             Id = 1, 
//             Email = registerDto.Email, 
//             FirstName = "Test", 
//             LastName = "User", 
//             Gender = "Male" 
//         };
//         var userDto = new UserDto 
//         {
//             Email = registerDto.Email,
//             FirstName = userEntity.FirstName,
//             LastName = userEntity.LastName,
//             Gender = userEntity.Gender
//         };

//         _mapperMock.Setup(m => m.Map<AppUser>(registerDto)).Returns(userEntity);
//         _userManagerMock.Setup(u => u.CreateAsync(userEntity, registerDto.Password)).ReturnsAsync(IdentityResult.Success);
//         _userManagerMock.Setup(u => u.AddToRoleAsync(userEntity, "Student")).ReturnsAsync(IdentityResult.Success);
//         _mapperMock.Setup(m => m.Map<UserDto>(userEntity)).Returns(userDto);

//         // Act
//         var result = await _authController.Signup(registerDto);

//         // Assert
//         var createdAtResult = Assert.IsType<CreatedAtActionResult>(result.Result);
//         var returnedUserDto = Assert.IsType<UserDto>(createdAtResult.Value);

//         Assert.Equal(nameof(_authController.GetUserById), createdAtResult.ActionName);
//         Assert.Equal(userDto.Email, returnedUserDto.Email);
//         Assert.Equal(userDto.FirstName, returnedUserDto.FirstName);
//         Assert.Equal(userDto.LastName, returnedUserDto.LastName);
//         Assert.Equal(userDto.Gender, returnedUserDto.Gender);
//     }
// }
