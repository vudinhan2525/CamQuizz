using Microsoft.AspNetCore.SignalR;

namespace CamQuizzBE.Presentation.Hubs;

public class QuizHub : Hub
{
    private readonly ILogger<QuizHub> _logger;

    public QuizHub(ILogger<QuizHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("Client Connected: {ConnectionId}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client Disconnected: {ConnectionId}, Error: {Error}", 
            Context.ConnectionId, exception?.Message ?? "None");
        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinQuiz(string quizId)
    {
        try
        {
            _logger.LogInformation("Joining quiz {QuizId}", quizId);
            await Groups.AddToGroupAsync(Context.ConnectionId, quizId);
            await Clients.Group(quizId).SendAsync("UserJoined", Context.ConnectionId);
            await Clients.Caller.SendAsync("JoinConfirmed", quizId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error joining quiz {QuizId}", quizId);
            throw;
        }
    }

    public async Task LeaveQuiz(string quizId)
    {
        try
        {
            _logger.LogInformation("Leaving quiz {QuizId}", quizId);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, quizId);
            await Clients.Group(quizId).SendAsync("UserLeft", Context.ConnectionId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error leaving quiz {QuizId}", quizId);
            throw;
        }
    }

    public async Task SendAnswer(string quizId, string answer)
    {
        try
        {
            _logger.LogInformation("Sending answer to quiz {QuizId}", quizId);
            await Clients.Group(quizId).SendAsync("ReceiveAnswer", Context.ConnectionId, answer);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending answer to quiz {QuizId}", quizId);
            throw;
        }
    }
}