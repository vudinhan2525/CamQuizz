namespace CamQuizzBE.Presentation.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Domain.Enums;
using CamQuizzBE.Applications.DTOs.Groups;

[Route("api/v1/members")]
[ApiController]
public class MemberController : ControllerBase
{
    private readonly IMemberService _memberService;

    public MemberController(IMemberService memberService)
    {
        _memberService = memberService;
    }

    [HttpGet("{groupId}")]
    public async Task<IActionResult> GetMembersByGroupId(int groupId)
    {
        var members = await _memberService.GetMembersByGroupIdAsync(groupId);
        return Ok(members);
    }

    [HttpGet("pending/{groupId}")]
    public async Task<IActionResult> GetPendingMembers(int groupId)
    {
        var members = await _memberService.GetPendingMembersAsync(groupId);
        return Ok(members);
    }

    [HttpGet("approved/{groupId}")]
    public async Task<IActionResult> GetApprovedMembers(int groupId)
    {
        var members = await _memberService.GetApprovedMembersAsync(groupId);
        return Ok(members);
    }

    [HttpPost("join/{groupId}")]
    public async Task<IActionResult> RequestToJoinGroup(int groupId, [FromQuery] int userId)
    {
        try
        {
            await _memberService.RequestToJoinGroupAsync(groupId, userId);
            return Ok(new { message = "Join request sent successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{groupId}/{userId}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateMemberStatus(
        int groupId,
        int userId,
        [FromQuery] int ownerId,
        [FromBody] UpdateMemberStatusDto updateDto)
    {
        try
        {
            await _memberService.UpdateMemberStatusAsync(groupId, userId, ownerId, updateDto.Status);
            return Ok(new { message = "Member status updated successfully" });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("leave/{groupId}")]
    public async Task<IActionResult> LeaveGroup(int groupId, [FromQuery] int userId)
    {
        await _memberService.LeaveGroupAsync(groupId, userId);
        return Ok(new { message = "Left group successfully" });
    }

    [HttpDelete("remove/{groupId}/{userId}")]
    public async Task<IActionResult> RemoveMember(int groupId, int userId, [FromQuery] int ownerId)
    {
        try
        {
            await _memberService.RemoveMemberAsync(groupId, userId, ownerId);
            return Ok(new { message = "Member removed successfully" });
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
    }
}
