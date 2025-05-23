namespace CamQuizzBE.Presentation.Controllers;

using CamQuizzBE.Applications.DTOs.Groups;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Applications.Services;
using CamQuizzBE.Presentation.Exceptions;
using Microsoft.AspNetCore.Mvc;
using CamQuizzBE.Presentation.Utils;

[Route("api/v1/groups")]
[ApiController]
public class GroupController : ControllerBase
{
    private readonly IGroupService _groupService;
    private readonly ILogger<GroupController> _logger;
    public GroupController(IGroupService groupService, ILogger<GroupController> logger)
    {
        _groupService = groupService;
        _logger = logger;
    }
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IEnumerable<GroupDto>>> GetAllGroups()
    {
        try
        {
            var groups = await _groupService.GetAllGroupsAsync();
            var response = new ApiResponse<IEnumerable<GroupDto>>(groups);

            return Ok(response);
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
        var response = new ApiResponse<IEnumerable<GroupDto>>(groups);
        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetGroupById(int id)
    {
        var group = await _groupService.GetGroupByIdAsync(id);
        if (group == null)
            return NotFound();
        var response = new ApiResponse<GroupDto>(group);
        return Ok(response);
    }

    [HttpPost("{groupId}/invite")]
    [Authorize]
    public async Task<IActionResult> InviteMemberByEmail(int groupId, [FromBody] InviteMemberDto inviteDto)
    {
        var inviterId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        // Check if user has permission to invite (is member)
        if (!await _groupService.IsMember(groupId, inviterId))
        {
            return Unauthorized("You must be a member to invite others");
        }

        var member = await _groupService.InviteMemberByEmailAsync(groupId, inviterId, inviteDto.Email);

        var response = new ApiResponse<string>($"Invitation sent to {inviteDto.Email}");

        return Ok(response);
    }

    [HttpPost("{groupId}/quizzes")]
    [Authorize]
    public async Task<IActionResult> ShareQuizWithGroup(int groupId, [FromBody] ShareQuizDto shareDto)
    {
        var sharerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        // Check if user is a member
        if (!await _groupService.IsMember(groupId, sharerId))
        {
            return Unauthorized("You must be a member to share quizzes");
        }

        var sharedQuiz = await _groupService.ShareQuizWithGroupAsync(groupId, sharerId, shareDto.QuizId);
        var response = new ApiResponse<GroupQuiz>(sharedQuiz);

        return Ok(response);
    }

    [HttpGet("{groupId}/quizzes")]
    [Authorize]
    public async Task<IActionResult> GetSharedQuizzes(int groupId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        if (!await _groupService.IsMember(groupId, userId))
        {
            return Unauthorized("You must be a member to view shared quizzes");
        }
        var quizzes = await _groupService.GetSharedQuizzesAsync(groupId);
        var response = new ApiResponse<IEnumerable<GroupQuiz>>(quizzes);

        return Ok(response);
    }

    [HttpDelete("{groupId}/quizzes/{quizId}")]
    [Authorize]
    public async Task<IActionResult> RemoveSharedQuiz(int groupId, int quizId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        if (!await _groupService.IsOwner(groupId, userId))
        {
            return Unauthorized("Only group owner can remove shared quizzes");
        }

        await _groupService.RemoveSharedQuizAsync(groupId, quizId);

        return Ok(new ApiResponse<string>("Quiz removed from group"));
    }

    [HttpGet("{groupId}/chat")]
    [Authorize]
    public async Task<IActionResult> GetChatHistory(int groupId, [FromQuery] int limit = 50)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        if (!await _groupService.IsMember(groupId, userId))
        {
            return Unauthorized("You must be a member to view chat history");
        }

        var messages = await _groupService.GetGroupChatHistoryAsync(groupId, limit);
        var response = new ApiResponse<IEnumerable<ChatMessage>>(messages);

        return Ok(response);
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
        var response = new ApiResponse<GroupDto>(createdGroup);

        return CreatedAtAction(nameof(GetGroupById), new { id = createdGroup.Id }, createdGroup);
    }
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteGroup(int id)
    {
        try
        {
            await _groupService.DeleteGroupAsync(id);
            return Ok(new ApiResponse<string>("Delete group success"));
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
            return Ok(new ApiResponse<string>("Update group status success"));
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
            var response = new ApiResponse<GroupDto>(updatedGroup);

            return Ok(response);
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
        var response = new ApiResponse<IEnumerable<MemberDto>>(pendingMembers);

        return Ok(response);
    }
}
