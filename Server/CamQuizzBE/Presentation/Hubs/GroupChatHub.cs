using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace CamQuizzBE.Presentation.Hubs;

[Authorize]
public class GroupChatHub : Hub
{
    private readonly IGroupService _groupService;
    private readonly IUserService _userService;

    public GroupChatHub(IGroupService groupService, IUserService userService)
    {
        _groupService = groupService;
        _userService = userService;
    }

    public async Task JoinGroup(int groupId)
    {
        var userId = int.Parse(Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var isMember = await _groupService.IsMember(groupId, userId);
        
        if (!isMember)
        {
            throw new HubException("Not a member of this group");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, $"group_{groupId}");
    }

    public async Task LeaveGroup(int groupId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"group_{groupId}");
    }

    public async Task SendMessage(int groupId, string message)
    {
        var userId = int.Parse(Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _userService.GetUserByIdAsync(userId);
        
        if (user == null)
        {
            throw new HubException("User not found");
        }

        var isMember = await _groupService.IsMember(groupId, userId);
        if (!isMember)
        {
            throw new HubException("Not a member of this group");
        }

        // Save message to database
        var chatMessage = new ChatMessage
        {
            GroupId = groupId,
            UserId = userId,
            Content = message
        };

        await _groupService.SaveChatMessage(chatMessage);

        // Send to all members in the group
        await Clients.Group($"group_{groupId}").SendAsync("ReceiveMessage", new
        {
            userId = userId,
            userName = $"{user.FirstName} {user.LastName}",
            message = message,
            sentAt = DateTime.UtcNow
        });
    }
}