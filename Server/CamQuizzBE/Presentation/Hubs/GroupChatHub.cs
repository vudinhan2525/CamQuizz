using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Infras.Data;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CamQuizzBE.Presentation.Hubs;

[AllowAnonymous]
public class GroupChatHub : Hub
{
    private static readonly Dictionary<string, HashSet<string>> _groups = new();
    private static readonly Dictionary<string, string> _userIds = new(); // Maps ConnectionId to UserId
    private readonly ILogger<GroupChatHub> _logger;
    private readonly DataContext _context;

    public GroupChatHub(ILogger<GroupChatHub> logger, DataContext context)
    {
        _logger = logger;
        _context = context;
    }

    public override async Task OnConnectedAsync()
    {
        try
        {
            _logger.LogInformation("Client Connected: {ConnectionId}", Context.ConnectionId);
            await base.OnConnectedAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in OnConnectedAsync for {ConnectionId}", Context.ConnectionId);
            throw;
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        try
        {
            _logger.LogInformation("Client Disconnected: {ConnectionId}, Error: {Error}",
                Context.ConnectionId, exception?.Message ?? "None");

            string? userId = _userIds.GetValueOrDefault(Context.ConnectionId);
            foreach (var group in _groups.Where(g => g.Value.Contains(Context.ConnectionId)))
            {
                await LeaveGroup(new LeaveGroupRequest(group.Key, userId));
            }
            _userIds.Remove(Context.ConnectionId);

            await base.OnDisconnectedAsync(exception);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in OnDisconnectedAsync for {ConnectionId}", Context.ConnectionId);
            throw;
        }
    }

    private async Task LoadPreviousMessages(string groupId, DateTime? before = null, int pageSize = 20)
    {
        try
        {
            var query = _context.ChatMessages
                .Where(m => m.GroupId.ToString() == groupId);

            if (before.HasValue)
            {
                query = query.Where(m => m.SentAt < before.Value);
            }

            var messages = await query
                .OrderByDescending(m => m.SentAt)
                .Take(pageSize)
                .Include(m => m.User)
                .OrderBy(m => m.SentAt)
                .Select(m => new
                {
                    MessageId = m.Id,
                    FromUserId = m.UserId.ToString(),
                    Message = m.Content,
                    Timestamp = m.SentAt,
                    UserName = m.User.FirstName + " " + m.User.LastName,
                    IsRead = m.MessageReads.Any(r => r.UserId.ToString() == Context.UserIdentifier)
                })
                .ToListAsync();

            if (messages.Any())
            {
                await Clients.Caller.SendAsync("loadPreviousMessages", new
                {
                    Messages = messages,
                    HasMore = messages.Count == pageSize
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading previous messages for group {GroupId}", groupId);
            throw;
        }
    }

    public async Task JoinGroup(JoinGroupRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.GroupId))
            {
                throw new HubException("GroupId cannot be empty");
            }
            if (string.IsNullOrEmpty(request.UserId))
            {
                throw new HubException("UserId cannot be empty");
            }

            if (!_groups.ContainsKey(request.GroupId))
            {
                _groups[request.GroupId] = new HashSet<string>();
            }

            _groups[request.GroupId].Add(Context.ConnectionId);
            _userIds[Context.ConnectionId] = request.UserId; // Store UserId
            await Groups.AddToGroupAsync(Context.ConnectionId, request.GroupId);
            await Clients.Group(request.GroupId).SendAsync("userJoined", new
            {
                ConnectionId = Context.ConnectionId,
                UserId = request.UserId
            });

            // Load previous messages for the user who just joined
            await LoadPreviousMessages(request.GroupId);

            _logger.LogInformation("Client {ConnectionId} (UserId: {UserId}) joined group {GroupId}",
                Context.ConnectionId, request.UserId, request.GroupId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error joining group {GroupId} for {ConnectionId} (UserId: {UserId})",
                request.GroupId, Context.ConnectionId, request.UserId);
            await Clients.Caller.SendAsync("error", new { Message = "Error joining group", Error = ex.Message });
            throw;
        }
    }

    public async Task LeaveGroup(LeaveGroupRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.GroupId))
            {
                throw new HubException("GroupId cannot be empty");
            }

            if (_groups.TryGetValue(request.GroupId, out var connections))
            {
                connections.Remove(Context.ConnectionId);
                if (!connections.Any())
                {
                    _groups.Remove(request.GroupId);
                }
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, request.GroupId);
                await Clients.Group(request.GroupId).SendAsync("userLeft", new
                {
                    ConnectionId = Context.ConnectionId,
                    UserId = request.UserId ?? _userIds.GetValueOrDefault(Context.ConnectionId)
                });

                _logger.LogInformation("Client {ConnectionId} (UserId: {UserId}) left group {GroupId}",
                    Context.ConnectionId, request.UserId ?? _userIds.GetValueOrDefault(Context.ConnectionId), request.GroupId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error leaving group {GroupId} for {ConnectionId} (UserId: {UserId})",
                request.GroupId, Context.ConnectionId, request.UserId ?? _userIds.GetValueOrDefault(Context.ConnectionId));
            await Clients.Caller.SendAsync("error", new { Message = "Error leaving group", Error = ex.Message });
            throw;
        }
    }

    public async Task SendMessage(SendMessageRequest request)
    {
        try
        {
            await ValidateMessageRequest(request);
            var chatMessage = await SaveMessage(request);
            await NotifyNewMessage(request, chatMessage);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending message in group {GroupId} from {ConnectionId} (UserId: {UserId})",
                request.GroupId, Context.ConnectionId, request.UserId);
            await Clients.Caller.SendAsync("error", new { Message = "Error sending message", Error = ex.Message });
            throw;
        }
    }

    private async Task ValidateMessageRequest(SendMessageRequest request)
    {
        if (string.IsNullOrEmpty(request.GroupId))
        {
            throw new HubException("GroupId cannot be empty");
        }
        if (string.IsNullOrEmpty(request.UserId))
        {
            throw new HubException("UserId cannot be empty");
        }
        if (string.IsNullOrEmpty(request.Message))
        {
            throw new HubException("Message cannot be empty");
        }

        if (!_groups.TryGetValue(request.GroupId, out var connections) || !connections.Contains(Context.ConnectionId))
        {
            throw new HubException("You are not a member of this group");
        }
    }

    private async Task<ChatMessage> SaveMessage(SendMessageRequest request)
    {
        var timestamp = DateTime.UtcNow;
        var chatMessage = new ChatMessage
        {
            GroupId = int.Parse(request.GroupId),
            UserId = int.Parse(request.UserId),
            Content = request.Message,
            SentAt = timestamp
        };

        _context.ChatMessages.Add(chatMessage);
        await _context.SaveChangesAsync();
        return chatMessage;
    }

    private async Task NotifyNewMessage(SendMessageRequest request, ChatMessage chatMessage)
    {
        var user = await _context.Users.FindAsync(int.Parse(request.UserId));
        var userName = user != null ? $"{user.FirstName} {user.LastName}" : "Unknown User";

        await Clients.Group(request.GroupId).SendAsync("receiveMessage", new
        {
            MessageId = chatMessage.Id,
            FromConnectionId = Context.ConnectionId,
            FromUserId = request.UserId,
            Message = request.Message,
            Timestamp = chatMessage.SentAt,
            UserName = userName
        });

        _logger.LogInformation("Message sent in group {GroupId} from {ConnectionId} (UserId: {UserId})",
            request.GroupId, Context.ConnectionId, request.UserId);
    }

    public async Task MarkMessagesAsRead(string groupId, string userId)
    {
        try
        {
            var unreadMessages = await _context.ChatMessages
                .Where(m => m.GroupId.ToString() == groupId && m.UserId.ToString() != userId &&
                           !m.MessageReads.Any(r => r.UserId.ToString() == userId))
                .ToListAsync();

            foreach (var message in unreadMessages)
            {
                _context.MessageReads.Add(new MessageRead
                {
                    MessageId = message.Id,
                    UserId = int.Parse(userId),
                    ReadAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();
            await Clients.Group(groupId).SendAsync("messagesRead", new { UserId = userId });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking messages as read in group {GroupId} for user {UserId}",
                groupId, userId);
            throw;
        }
    }

    public async Task GetUnreadMessageCount(string groupId, string userId)
    {
        try
        {
            var unreadCount = await _context.ChatMessages
                .Where(m => m.GroupId.ToString() == groupId &&
                           m.UserId.ToString() != userId &&
                           !m.MessageReads.Any(r => r.UserId.ToString() == userId))
                .CountAsync();

            await Clients.Caller.SendAsync("unreadMessageCount", new {
                GroupId = groupId,
                Count = unreadCount
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting unread message count for group {GroupId} and user {UserId}",
                groupId, userId);
            throw;
        }
    }
}

public record JoinGroupRequest(string GroupId, string UserId);
public record LeaveGroupRequest(string GroupId, string? UserId);
public record SendMessageRequest(string GroupId, string UserId, string Message);