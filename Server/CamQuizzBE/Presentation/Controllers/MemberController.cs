namespace CamQuizzBE.Presentation.Controllers;

using CamQuizzBE.Applications.Services;
using CamQuizzBE.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

[Route("api/members")]
[ApiController]
public class MemberController : ControllerBase
{
    private readonly IMemberService _memberService;

    public MemberController(IMemberService memberService)
    {
        _memberService = memberService;
    }

    /// <summary>
    /// Get all members of a group
    /// </summary>
    [HttpGet("{groupId}")]
    public async Task<IActionResult> GetMembersByGroupId(int groupId)
    {
        var members = await _memberService.GetMembersByGroupIdAsync(groupId);
        return Ok(members);
    }

    /// <summary>
    /// Request to join a group
    /// </summary>
    [HttpPost("join/{groupId}")]
    public async Task<IActionResult> RequestToJoinGroup(int groupId, [FromQuery] int userId)
    {
        await _memberService.RequestToJoinGroupAsync(groupId, userId);
        return Ok(new { Message = "Join request sent. Waiting for approval." });
    }

    /// <summary>
    /// Approve a member's request (Only group owner)
    /// </summary>
    [HttpPost("approve/{groupId}/{userId}")]
    public async Task<IActionResult> ApproveMember(int groupId, int userId, [FromQuery] int ownerId)
    {
        await _memberService.ApproveMemberAsync(groupId, userId, ownerId);
        return Ok(new { Message = "Member approved successfully." });
    }

    /// <summary>
    /// Leave a group
    /// </summary>
    [HttpDelete("leave/{groupId}")]
    public async Task<IActionResult> LeaveGroup(int groupId, [FromQuery] int userId)
    {
        await _memberService.LeaveGroupAsync(groupId, userId);
        return Ok(new { Message = "You have left the group." });
    }

    /// <summary>
    /// Remove a member from a group (Only owner)
    /// </summary>
    [HttpDelete("remove/{groupId}/{userId}")]
    public async Task<IActionResult> RemoveMember(int groupId, int userId, [FromQuery] int ownerId)
    {
        await _memberService.RemoveMemberAsync(groupId, userId, ownerId);
        return Ok(new { Message = "Member removed from the group." });
    }
}
