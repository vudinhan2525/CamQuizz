namespace CamQuizzBE.Presentation.Controllers;
using CamQuizzBE.Applications.DTOs.Groups;
using CamQuizzBE.Domain.Entities; 
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Applications.Services;
using Microsoft.AspNetCore.Mvc;

[Route("api/v1/groups")]
[ApiController]
public class GroupController : ControllerBase
{
    private readonly GroupService _groupService;
    public GroupController(GroupService groupService)
        {
            _groupService = groupService;
        }
    // [HttpGet]
    // public async Task<ActionResult<IEnumerable<GroupDto>>> GetAllGroups()
    // {
    //     var groups = await _groupService.GetAllGroupsAsync();
    //     return Ok(groups);
    // }

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
        await _groupService.DeleteGroupAsync(id);
        return NoContent();
    }
}
