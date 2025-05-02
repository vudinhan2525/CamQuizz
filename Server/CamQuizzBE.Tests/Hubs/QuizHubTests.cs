using System.Threading.Tasks;
using CamQuizzBE.Presentation.Hubs;
using Microsoft.AspNetCore.SignalR;
using Moq;
using Xunit;
using System.Security.Claims;

namespace CamQuizzBE.Tests.Hubs;

public class QuizHubTests
{
    private readonly QuizHub _hub;
    private readonly Mock<IHubCallerClients> _mockClients;
    private readonly Mock<IGroupManager> _mockGroups;
    private readonly Mock<HubCallerContext> _mockHubContext;
    private const string TestConnectionId = "test-connection-id";
    private const string TestQuizId = "test-quiz-id";

    public QuizHubTests()
    {
        _mockClients = new Mock<IHubCallerClients>();
        _mockGroups = new Mock<IGroupManager>();
        _mockHubContext = new Mock<HubCallerContext>();
        
        // Setup hub context with test connection id
        _mockHubContext.Setup(x => x.ConnectionId).Returns(TestConnectionId);
        
        _hub = new QuizHub
        {
            Clients = _mockClients.Object,
            Groups = _mockGroups.Object,
            Context = _mockHubContext.Object
        };
    }

    [Fact]
    public async Task JoinQuiz_AddsToGroupAndNotifiesOthers()
    {
        // Arrange
        var mockGroupClients = new Mock<IClientProxy>();
        _mockClients.Setup(c => c.Group(TestQuizId)).Returns(mockGroupClients.Object);

        // Act
        await _hub.JoinQuiz(TestQuizId);

        // Assert
        _mockGroups.Verify(
            g => g.AddToGroupAsync(TestConnectionId, TestQuizId, default),
            Times.Once);

        mockGroupClients.Verify(
            c => c.SendCoreAsync(
                "UserJoined",
                It.Is<object[]>(o => o[0].ToString() == TestConnectionId),
                default),
            Times.Once);
    }

    [Fact]
    public async Task LeaveQuiz_RemovesFromGroupAndNotifiesOthers()
    {
        // Arrange
        var mockGroupClients = new Mock<IClientProxy>();
        _mockClients.Setup(c => c.Group(TestQuizId)).Returns(mockGroupClients.Object);

        // Act
        await _hub.LeaveQuiz(TestQuizId);

        // Assert
        _mockGroups.Verify(
            g => g.RemoveFromGroupAsync(TestConnectionId, TestQuizId, default),
            Times.Once);

        mockGroupClients.Verify(
            c => c.SendCoreAsync(
                "UserLeft",
                It.Is<object[]>(o => o[0].ToString() == TestConnectionId),
                default),
            Times.Once);
    }

    [Fact]
    public async Task SendAnswer_BroadcastsToGroup()
    {
        // Arrange
        var mockGroupClients = new Mock<IClientProxy>();
        _mockClients.Setup(c => c.Group(TestQuizId)).Returns(mockGroupClients.Object);
        var testAnswer = "test-answer";

        // Act
        await _hub.SendAnswer(TestQuizId, testAnswer);

        // Assert
        mockGroupClients.Verify(
            c => c.SendCoreAsync(
                "ReceiveAnswer",
                It.Is<object[]>(o => 
                    o[0].ToString() == TestConnectionId && 
                    o[1].ToString() == testAnswer),
                default),
            Times.Once);
    }
}