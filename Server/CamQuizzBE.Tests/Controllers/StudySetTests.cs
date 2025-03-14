using AutoMapper;
using CamQuizzBE.Applications.DTOs.FlashCards;
using CamQuizzBE.Applications.DTOs.StudySets;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Presentation.Controllers;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

public class StudySetFlashCardTests
{
    private readonly Mock<IStudySetService> _studySetServiceMock;
    private readonly Mock<IFlashCardService> _flashCardServiceMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly StudySetController _studySetController;
    private readonly FlashCardController _flashCardController;

    public StudySetFlashCardTests()
    {
        _studySetServiceMock = new Mock<IStudySetService>();
        _flashCardServiceMock = new Mock<IFlashCardService>();
        _mapperMock = new Mock<IMapper>();

        _studySetController = new StudySetController(_studySetServiceMock.Object);
        _flashCardController = new FlashCardController(_flashCardServiceMock.Object);
    }

    [Fact]
    public async Task CreateStudySet_ReturnsCreatedAtAction_WhenModelIsValid()
    {
        var studySetDto = new CreateStudySetDto { Name = "Test Study Set" };
        var studySetEntity = new StudySet { Id = 1, Name = studySetDto.Name };

        _studySetServiceMock.Setup(s => s.CreateStudySetAsync(studySetDto)).ReturnsAsync(studySetEntity);

        var result = await _studySetController.CreateStudySet(studySetDto) as CreatedAtActionResult;

        Assert.NotNull(result);
        Assert.Equal(nameof(_studySetController.GetStudySetById), result?.ActionName);
        Assert.IsType<StudySet>(result?.Value);
    }

    [Fact]
    public async Task GetStudySetById_ReturnsOk_WhenStudySetExists()
    {
        var studySetDto = new StudySetDto { Id = 1, Name = "Existing Study Set" };
        _studySetServiceMock.Setup(s => s.GetStudySetByIdAsync(1)).ReturnsAsync(studySetDto);


        var result = await _studySetController.GetStudySetById(1) as OkObjectResult;

        Assert.NotNull(result);
        Assert.Equal(200, result.StatusCode);
        Assert.Equal(studySetDto, result.Value);
    }
    [Fact]
    public async Task DeleteStudySet_ReturnsNoContent_WhenDeletionIsSuccessful()
    {
        _studySetServiceMock.Setup(s => s.DeleteStudySetAsync(1)).Returns(Task.CompletedTask);

        var result = await _studySetController.DeleteStudySet(1) as NoContentResult;

        Assert.NotNull(result);
        Assert.Equal(204, result.StatusCode);
    }
    [Fact]
    public async Task CreateFlashCard_ReturnsCreatedAtAction_WhenModelIsValid()
    {
        var flashCardDto = new CreateFlashCardDto { Question = "What is C#?", Answer = "A programming language." };
        var flashCardEntity = new FlashCard { Id = 1, Question = flashCardDto.Question, Answer = flashCardDto.Answer };

        _flashCardServiceMock.Setup(s => s.CreateAsync(flashCardDto)).ReturnsAsync(flashCardEntity);

        var result = await _flashCardController.CreateFlashCard(flashCardDto) as CreatedAtActionResult;

        Assert.NotNull(result);
        Assert.Equal(nameof(_flashCardController.GetFlashCardById), result?.ActionName);
        Assert.IsType<FlashCard>(result?.Value);
    }
}
