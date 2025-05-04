using Microsoft.AspNetCore.SignalR;

namespace CamQuizzBE.Presentation.Hubs;

public class QuizHub : Hub
{
    public async Task JoinQuiz(string quizId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, quizId);
        await Clients.Group(quizId).SendAsync("UserJoined", Context.ConnectionId);
    }

    public async Task LeaveQuiz(string quizId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, quizId);
        await Clients.Group(quizId).SendAsync("UserLeft", Context.ConnectionId);
    }

    public async Task SendAnswer(string quizId, string answer)
    {
        await Clients.Group(quizId).SendAsync("ReceiveAnswer", Context.ConnectionId, answer);
    }
}