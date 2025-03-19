using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Presentation.Controllers;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using System.Threading.Tasks;

public class GroupControllerTests
{
    private readonly Mock<IGroupService> _groupServiceMock;
    private readonly GroupController _controller;

    public GroupControllerTests()
    {
        _groupServiceMock = new Mock<IGroupService>();
        _controller = new GroupController(_groupServiceMock.Object);
    }

    [Theory]
    [InlineData(GroupStatus.Active, 0)]  // Test with 0
    [InlineData(GroupStatus.Deleted, 1)] // Test with 1
    [InlineData(GroupStatus.OnHold, 2)]  // Test with 2
    public async Task UpdateStatus_Success_ReturnsOk(GroupStatus newStatus, int expectedStatusValue)
    {
        // Arrange
        int groupId = 3;
        _groupServiceMock.Setup(s => s.UpdateGroupStatusAsync(groupId, newStatus))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.UpdateStatus(groupId, newStatus);

        // Assert
        var okResult = Assert.IsType<OkResult>(result);
        Assert.Equal(200, okResult.StatusCode);
        _groupServiceMock.Verify(s => s.UpdateGroupStatusAsync(groupId, newStatus), Times.Once);
    }

    [Fact]
    public async Task UpdateStatus_GroupNotFound_ReturnsNotFound()
    {
        // Arrange
        int groupId = 3;
        GroupStatus newStatus = GroupStatus.Active;
        _groupServiceMock.Setup(s => s.UpdateGroupStatusAsync(groupId, newStatus))
            .ThrowsAsync(new KeyNotFoundException($"Group with ID {groupId} not found."));

        // Act
        var result = await _controller.UpdateStatus(groupId, newStatus);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal($"Group with ID {groupId} not found.", notFoundResult.Value);
        Assert.Equal(404, notFoundResult.StatusCode);
    }
}