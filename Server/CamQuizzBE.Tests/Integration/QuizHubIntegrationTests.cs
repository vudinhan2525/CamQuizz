using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR.Client;
using System.Collections.Generic;
using Xunit;

namespace CamQuizzBE.Tests.Integration;

public class QuizHubIntegrationTests : IAsyncDisposable
{
    private readonly HubConnection _connection1;
    private readonly HubConnection _connection2;
    private readonly TestHost _testHost;
    private readonly List<string> _receivedMessages = new();

    public QuizHubIntegrationTests()
    {
        _testHost = new TestHost();
        _testHost.StartAsync().Wait();

        _connection1 = new HubConnectionBuilder()
            .WithUrl(_testHost.ServerUrl + "/quizHub", options =>
            {
                options.HttpMessageHandlerFactory = _ => _testHost.MessageHandler;
            })
            .Build();

        _connection2 = new HubConnectionBuilder()
            .WithUrl(_testHost.ServerUrl + "/quizHub", options =>
            {
                options.HttpMessageHandlerFactory = _ => _testHost.MessageHandler;
            })
            .Build();
    }

    private async Task InitializeAsync()
    {
        await _connection1.StartAsync();
        await _connection2.StartAsync();
        _receivedMessages.Clear();
    }

    [Fact]
    public async Task Users_CanJoinAndCommunicateInQuiz()
    {
        // Arrange
        await InitializeAsync();
        var quizId = "test-quiz-123";
        var testAnswer = "test-answer";
        var messageReceived = new TaskCompletionSource<bool>();

        _connection2.On<string>("UserJoined", (userId) =>
        {
            _receivedMessages.Add($"User {userId} joined");
        });

        _connection2.On<string, string>("ReceiveAnswer", (userId, answer) =>
        {
            _receivedMessages.Add($"User {userId} answered: {answer}");
            messageReceived.SetResult(true);
        });

        try
        {
            // Act
            await _connection1.InvokeAsync("JoinQuiz", quizId);
            await _connection2.InvokeAsync("JoinQuiz", quizId);
            await Task.Delay(100); // Give time for join messages to be processed
            await _connection1.InvokeAsync("SendAnswer", quizId, testAnswer);

            // Assert
            await Task.WhenAny(messageReceived.Task, Task.Delay(5000));
            Assert.True(messageReceived.Task.IsCompleted, "Message was not received within timeout");
            Assert.Equal(2, _receivedMessages.Count);
            Assert.Contains(testAnswer, _receivedMessages[1]);
        }
        catch (Exception ex)
        {
            throw new Exception($"Test failed: {ex.Message}", ex);
        }
    }

    [Fact]
    public async Task User_CanLeaveQuiz()
    {
        // Arrange
        await InitializeAsync();
        var quizId = "test-quiz-456";
        var userLeftReceived = new TaskCompletionSource<bool>();

        _connection2.On<string>("UserLeft", (userId) =>
        {
            _receivedMessages.Add($"User {userId} left");
            userLeftReceived.SetResult(true);
        });

        try
        {
            // Act
            await _connection1.InvokeAsync("JoinQuiz", quizId);
            await _connection2.InvokeAsync("JoinQuiz", quizId);
            await Task.Delay(100); // Give time for join messages to be processed
            await _connection1.InvokeAsync("LeaveQuiz", quizId);

            // Assert
            await Task.WhenAny(userLeftReceived.Task, Task.Delay(5000));
            Assert.True(userLeftReceived.Task.IsCompleted, "Leave message was not received within timeout");
            Assert.Contains(_receivedMessages, m => m.Contains("left"));
        }
        catch (Exception ex)
        {
            throw new Exception($"Test failed: {ex.Message}", ex);
        }
    }

    public async ValueTask DisposeAsync()
    {
        await _testHost.DisposeAsync();
        if (_connection1 != null)
        {
            await _connection1.DisposeAsync();
        }
        if (_connection2 != null)
        {
            await _connection2.DisposeAsync();
        }
    }
}