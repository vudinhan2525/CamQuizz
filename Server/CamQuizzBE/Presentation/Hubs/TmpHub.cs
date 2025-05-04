using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace CamQuizzBE.Presentation.Hubs;

[AllowAnonymous]
public class TmpHub : Hub
{
    private readonly ILogger<TmpHub> _logger;

    public TmpHub(ILogger<TmpHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("Handshake completed - Connection {ConnectionId}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Connection closed - {ConnectionId}, Error: {Error}",
            Context.ConnectionId, exception?.Message ?? "None");
        return base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(string message)
    {
        try
        {
            _logger.LogInformation("Received message: {Message} from {ConnectionId}", message, Context.ConnectionId);
            await Clients.All.SendAsync("ReceiveMessage", message);
            _logger.LogInformation("Message sent to all clients: {Message}", message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in SendMessage for {ConnectionId}", Context.ConnectionId);
            throw;
        }
    }

    public async Task Ping(string message)
    {
        _logger.LogInformation("Ping: {Message} from {ConnectionId}", message, Context.ConnectionId);
        await Clients.Caller.SendAsync("Pong", message);
    }
}