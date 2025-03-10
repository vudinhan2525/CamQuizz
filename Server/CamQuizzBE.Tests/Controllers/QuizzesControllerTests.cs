// using AutoMapper;
// using CamQuizzBE.Applications.DTOs.Quizzes;
// using CamQuizzBE.Domain.Entities;
// using CamQuizzBE.Domain.Interfaces;
// using CamQuizzBE.Presentation.Controllers;
// using Microsoft.AspNetCore.Mvc;
// using Moq;
// using Xunit;

// public class QuizzesControllerTests
// {
//     private readonly Mock<IQuizzesService> _quizzesServiceMock;
//     private readonly Mock<IMapper> _mapperMock;
//     private readonly QuizzesController _controller;

//     public QuizzesControllerTests()
//     {
//         _quizzesServiceMock = new Mock<IQuizzesService>();
//         _mapperMock = new Mock<IMapper>();

//         _controller = new QuizzesController(_quizzesServiceMock.Object, _mapperMock.Object);
//     }

//     [Fact]
//     public async Task CreateQuiz_ReturnsCreatedAtAction_WhenModelIsValid()
//     {
//         // Arrange
//         var quizDto = new QuizzesDto
//         {
//             Title = "Sample Quiz",
//             Description = "This is a test quiz"
//         };

//         var quizEntity = new Quizzes
//         {
//             Id = 1,
//             Title = quizDto.Title,
//             Description = quizDto.Description
//         };

//         _mapperMock.Setup(m => m.Map<Quizzes>(quizDto)).Returns(quizEntity);
//         _mapperMock.Setup(m => m.Map<QuizzesDto>(quizEntity)).Returns(quizDto);

//         // Act
//         var result = await _controller.CreateQuiz(quizDto) as CreatedAtActionResult;

//         // Assert
//         Assert.NotNull(result);
//         Assert.Equal(nameof(_controller.GetQuizById), result?.ActionName);
//         Assert.IsType<QuizzesDto>(result?.Value);

//         var returnedDto = result?.Value as QuizzesDto;
//         Assert.Equal(quizDto.Title, returnedDto?.Title);
//         Assert.Equal(quizDto.Description, returnedDto?.Description);

//         _quizzesServiceMock.Verify(s => s.CreateQuizAsync(It.IsAny<Quizzes>()), Times.Once);
//     }

//     [Fact]
//     public async Task CreateQuiz_ReturnsBadRequest_WhenModelStateIsInvalid()
//     {
//         // Arrange
//         var quizDto = new QuizzesDto();  // Invalid DTO (missing required fields)
//         _controller.ModelState.AddModelError("Title", "Required");

//         // Act
//         var result = await _controller.CreateQuiz(quizDto) as BadRequestObjectResult;

//         // Assert
//         Assert.NotNull(result);
//         Assert.Equal(400, result?.StatusCode);
//         Assert.IsType<SerializableError>(result?.Value);

//         _quizzesServiceMock.Verify(s => s.CreateQuizAsync(It.IsAny<Quizzes>()), Times.Never);
//     }
// }
