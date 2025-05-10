namespace CamQuizzBE.Presentation.Controllers;
using CamQuizzBE.Applications.DTOs.Groups;
using CamQuizzBE.Domain.Entities; 
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Applications.Services;
using CamQuizzBE.Presentation.Exceptions;
using Microsoft.AspNetCore.Mvc;

[Route("api/v1/groups")]
[ApiController]
public class GroupController : ControllerBase
{
    private readonly IGroupService _groupService;
    public GroupController(IGroupService groupService)
    {
        _groupService = groupService;
    }
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IEnumerable<GroupDto>>> GetAllGroups()
    {
        try
        {
            var groups = await _groupService.GetAllGroupsAsync();
            return Ok(groups);
        }
        catch (Exception)
        {
            return StatusCode(500, "An error occurred while retrieving groups");
        }
    }

    [HttpGet("my-groups/{userId}")]
    [Authorize]  
     public async Task<IActionResult> GetMyGroups(int userId)
    {
        var groups = await _groupService.GetMyGroupsAsync(userId);
        return Ok(groups);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetGroupById(int id)
    {
        var group = await _groupService.GetGroupByIdAsync(id);
        if (group == null)
            return NotFound();
        return Ok(group);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateGroup([FromBody] CreateGroupDto groupDto)
    {
        if (groupDto == null)
        {
            return BadRequest("Invalid group data.");
        }
        var createdGroup = await _groupService.CreateGroupAsync(groupDto);
        return CreatedAtAction(nameof(GetGroupById), new { id = createdGroup.Id }, createdGroup);
    }
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteGroup(int id)
    {
        try
        {
            await _groupService.DeleteGroupAsync(id);
            return NoContent();
        }
        catch (ValidatorException ex)
        {
            return BadRequest(ex.Message);
        }
    }
    [HttpPut("{groupId}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateStatus(int groupId, [FromBody] UpdateGroupStatusDto newStatus)
    {
        try
        {
            await _groupService.UpdateGroupStatusAsync(groupId, newStatus);
            return Ok();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateGroup(int id, [FromBody] UpdateGroupDto updateGroupDto)
    {
        try
        {
            var updatedGroup = await _groupService.UpdateGroupAsync(id, updateGroupDto);
            return Ok(updatedGroup);
        }
        catch (ValidatorException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (NotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }
    [HttpGet("{groupId}/pending-members")]
    [Authorize]
    public async Task<IActionResult> GetPendingMembers(int groupId)
    {
        var pendingMembers = await _groupService.GetPendingMembersAsync(groupId);
        return Ok(pendingMembers);
    }
}
