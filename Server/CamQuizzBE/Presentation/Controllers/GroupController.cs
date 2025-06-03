namespace CamQuizzBE.Presentation.Controllers;

using System.Security.Claims;
using CamQuizzBE.Applications.DTOs.Groups;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Domain.Enums;
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
    public async Task<IActionResult> GetGroupById([FromRoute] int id)
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

    /// <summary>
    /// Shares a quiz within a group
    /// </summary>
    /// <param name="groupId">ID of the group</param>
    /// <param name="shareDto">Quiz sharing details</param>
    /// <returns>Details of the shared quiz</returns>
    /// <response code="200">Quiz was successfully shared</response>
    /// <response code="400">If quiz is already shared or other validation errors</response>
    /// <response code="401">If user is not authorized to share quizzes</response>
    /// <response code="404">If quiz or group is not found</response>
    [HttpPost("{groupId}/quizzes")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<GroupQuiz>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ShareQuizWithGroup(int groupId, [FromBody] ShareQuizDto shareDto)
    {
        try
        {
            var sharerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (sharerId == 0)
            {
                return Unauthorized(new ApiResponse<string>(null, "User not authenticated"));
            }

            var sharedQuiz = await _groupService.ShareQuizWithGroupAsync(groupId, sharerId, shareDto.QuizId);
            
            _logger.LogInformation(
                "User {UserId} successfully shared quiz {QuizId} in group {GroupId}",
                sharerId, shareDto.QuizId, groupId);

            var response = new ApiResponse<GroupQuiz>(
                sharedQuiz,
                "Quiz shared successfully"
            );

            return Ok(response);
        }
        catch (ValidatorException ex)
        {
            _logger.LogWarning(ex, "Validation error while sharing quiz {QuizId} in group {GroupId}",
                shareDto.QuizId, groupId);
            return BadRequest(new ApiResponse<string>(null, ex.Message));
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Not found error while sharing quiz {QuizId} in group {GroupId}",
                shareDto.QuizId, groupId);
            return NotFound(new ApiResponse<string>(null, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sharing quiz {QuizId} in group {GroupId}",
                shareDto.QuizId, groupId);
            return StatusCode(500, new ApiResponse<string>(null, "An error occurred while sharing the quiz"));
        }
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

    [HttpGet("shared-with-me")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<List<SharedQuizDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetQuizzesSharedWithMe()
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0)
            {
                return Unauthorized(new ApiResponse<object>(null, "User not authenticated"));
            }

            var sharedQuizzes = await _groupService.GetAllSharedQuizzesForUserAsync(userId);
            
            _logger.LogInformation("Retrieved {Count} shared quizzes for user {UserId}",
                sharedQuizzes.Count, userId);
                
            var response = new ApiResponse<List<SharedQuizDto>>(
                sharedQuizzes,
                $"Successfully retrieved {sharedQuizzes.Count} shared quizzes"
            );
            
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving shared quizzes for user");
            return StatusCode(500, new ApiResponse<object>(null, "Error retrieving shared quizzes"));
        }
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


    /// <summary>
    /// Accepts or rejects a group invitation
    /// </summary>
    /// <param name="groupId">The ID of the group</param>
    /// <param name="statusDto">New status (Approved to accept, Rejected to decline)</param>
    /// <returns>Updated member details</returns>
    [HttpPut("respond-invitation/{groupId}")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<MemberDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RespondToInvitation(int groupId, [FromBody] UpdateMemberStatusDto statusDto)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0)
            {
                return Unauthorized(new ApiResponse<string>(null, "User not authenticated"));
            }

            if (statusDto.Status != MemberStatus.Approved && statusDto.Status != MemberStatus.Rejected)
            {
                return BadRequest(new ApiResponse<string>(null, "Invalid status. Use Approved to accept or Rejected to decline"));
            }

            var member = await _groupService.UpdateMemberStatusAsync(groupId, userId, statusDto.Status);
            
            var action = statusDto.Status == MemberStatus.Approved ? "accepted" : "declined";
            _logger.LogInformation(
                "User {UserId} {Action} invitation for group {GroupId}",
                userId, action, groupId);

            var message = statusDto.Status == MemberStatus.Approved ?
                "Successfully joined the group" :
                "Invitation declined";

            var response = new ApiResponse<MemberDto>(member, message);

            return Ok(response);
        }
        catch (ValidatorException ex)
        {
            _logger.LogWarning(ex, "Validation error updating member status for user {UserId} in group {GroupId}",
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0", groupId);
            return BadRequest(new ApiResponse<string>(null, ex.Message));
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Not found error updating member status for user {UserId} in group {GroupId}",
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0", groupId);
            return NotFound(new ApiResponse<string>(null, ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating member status for user {UserId} in group {GroupId}",
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0", groupId);
            return StatusCode(500, new ApiResponse<string>(null, "An error occurred while updating member status"));
        }
    }
}
