namespace CamQuizzBE.Applications.Services;

using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Domain.Repositories;
using CamQuizzBE.Domain.Enums;
using CamQuizzBE.Presentation.Exceptions;
using CamQuizzBE.Applications.DTOs.Groups;
using System.Collections.Generic;
using System.Threading.Tasks;

public class GroupService : IGroupService
{
    private readonly IGroupRepository _groupRepo;
    private readonly IUserRepository _userRepo;
    private readonly IQuizzesRepository _quizRepo;
    private readonly IUserService _userService;

    public GroupService(
        IGroupRepository groupRepo,
        IUserRepository userRepo,
        IQuizzesRepository quizRepo,
        IUserService userService)
    {
        _groupRepo = groupRepo ?? throw new ArgumentNullException(nameof(groupRepo));
        _userRepo = userRepo ?? throw new ArgumentNullException(nameof(userRepo));
        _quizRepo = quizRepo ?? throw new ArgumentNullException(nameof(quizRepo));
        _userService = userService ?? throw new ArgumentNullException(nameof(userService));
    }
    public async Task<IEnumerable<GroupDto>> GetMyGroupsAsync(int userId, string status = "Active", bool isOwner = true)
    {
        if (userId <= 0)
            throw new ValidatorException("Invalid user ID");

        var user = await _userRepo.GetUserByIdAsync(userId);
        if (user == null)
            throw new NotFoundException("User not found");

        return await _groupRepo.GetMyGroupsAsync(userId, status, isOwner);
    }
    public async Task<IEnumerable<GroupDto>> GetAllGroupsAsync()
    {
        return await _groupRepo.GetAllGroupsAsync();
    }
    public async Task<IEnumerable<GroupDto>> GetGroupsAsync(string? search, int page, int pageSize, string? sort)
    {
        if (page <= 0 || pageSize <= 0)
            throw new ValidatorException("Invalid pagination parameters");

        return await _groupRepo.GetGroupsAsync(search, page, pageSize, sort);
    }

    public async Task<IEnumerable<GroupDto>> GetMyGroupsAsync(int userId, string? search, int page, int pageSize, string? sort)
    {
        if (userId <= 0)
            throw new ValidatorException("Invalid user ID");

        var user = await _userRepo.GetUserByIdAsync(userId);
        if (user == null)
            throw new NotFoundException("User not found");

        return await _groupRepo.GetMyGroupsAsync(userId, search, page, pageSize, sort);
    }

    public async Task<Member?> GetMemberAsync(int groupId, int userId)
    {
        if (groupId <= 0 || userId <= 0)
            throw new ValidatorException("Invalid group ID or user ID");

        return await _groupRepo.GetMemberAsync(groupId, userId);
    }

    public async Task<IEnumerable<GroupDto>> GetMyGroupsAsync(int userId)
    {
        if (userId <= 0)
            throw new ValidatorException("Invalid user ID");

        var user = await _userRepo.GetUserByIdAsync(userId);
        if (user == null)
            throw new NotFoundException("User not found");

        return await _groupRepo.GetMyGroupsAsync(userId);
    }

    public async Task<GroupDto?> GetGroupByIdAsync(int id)
    {
        if (id <= 0)
            throw new ValidatorException("Invalid group ID");

        var group = await _groupRepo.GetGroupByIdAsync(id);
        if (group == null)
            throw new NotFoundException("Group not found");

        var owner = await _userRepo.GetUserByIdAsync(group.OwnerId);
        var sharedQuizzes = await GetSharedQuizzesAsync(id);

        group.OwnerName = $"{owner?.FirstName} {owner?.LastName}".Trim();
        group.SharedQuizzes = sharedQuizzes.Where(sq => sq.Quiz != null).Select(sq => new SharedQuizDto
        {
            QuizId = sq.QuizId,
            QuizName = sq.Quiz?.Name ?? string.Empty,
            Image = sq.Quiz?.Image ?? string.Empty,
            Duration = sq.Quiz?.Duration ?? 0,
            NumberOfQuestions = sq.Quiz?.NumberOfQuestions ?? 0,
            SharedById = sq.SharedById,
            SharedByName = string.Empty,
            SharedAt = sq.SharedAt,
            Status = sq.Quiz?.Status ?? QuizStatus.Public
        }).ToList();

        return group;
    }

    public async Task<GroupDto> CreateGroupAsync(CreateGroupDto postGroupDto)
    {
        if (postGroupDto == null)
            throw new ArgumentNullException(nameof(postGroupDto));

        // Assume CreateGroupDto contains OwnerId
        var owner = await _userRepo.GetUserByIdAsync(postGroupDto.OwnerId);
        if (owner == null)
            throw new NotFoundException("Owner not found");

        if (string.IsNullOrWhiteSpace(postGroupDto.Name))
            throw new ValidatorException("Group name is required");

        var group = new Group
        {
            Name = postGroupDto.Name.Trim(),
            Description = postGroupDto.Description?.Trim() ?? string.Empty,
            OwnerId = postGroupDto.OwnerId,
            Status = GroupStatus.Active
        };

        await _groupRepo.AddAsync(group);
        await _groupRepo.SaveChangesAsync();

        var member = new Member
        {
            GroupId = group.Id,
            UserId = postGroupDto.OwnerId,
            Status = MemberStatus.Approved
        };
        await _groupRepo.AddMemberAsync(member);
        await _groupRepo.SaveChangesAsync();

        var groupDto = new GroupDto
        {
            Id = group.Id,
            Name = group.Name,
            Description = group.Description,
            OwnerId = group.OwnerId,
            OwnerName = $"{owner.FirstName} {owner.LastName}".Trim(),
            Status = group.Status,
            CreatedAt = group.CreatedAt,
            UpdatedAt = group.UpdatedAt,
            Members = new List<MemberDto>
            {
                new()
                {
                    UserId = postGroupDto.OwnerId,
                    GroupId = group.Id,
                    Status = MemberStatus.Approved
                }
            },
            SharedQuizzes = new List<SharedQuizDto>()
        };

        return groupDto;
    }
    public async Task DeleteGroupAsync(int id)
    {
        if (id <= 0)
            throw new ValidatorException("Invalid group ID");

        var group = await _groupRepo.GetGroupByIdAsync(id);
        if (group == null)
            throw new NotFoundException("Group not found");

        await _groupRepo.DeleteAsync(id);
        await _groupRepo.SaveChangesAsync();
    }

    public async Task UpdateGroupStatusAsync(int groupId, UpdateGroupStatusDto updateGroupStatusDto)
    {
        if (groupId <= 0)
            throw new ValidatorException("Invalid group ID");

        if (updateGroupStatusDto == null)
            throw new ArgumentNullException(nameof(updateGroupStatusDto));

        var group = await _groupRepo.GetGroupByIdAsync(groupId);
        if (group == null)
            throw new NotFoundException("Group not found");

        await _groupRepo.UpdateStatusAsync(groupId, updateGroupStatusDto);
        await _groupRepo.SaveChangesAsync();
    }

    public async Task<GroupDto> UpdateGroupAsync(int id, UpdateGroupDto updateGroupDto)
    {
        if (id <= 0)
            throw new ValidatorException("Invalid group ID");

        if (updateGroupDto == null)
            throw new ArgumentNullException(nameof(updateGroupDto));

        if (string.IsNullOrWhiteSpace(updateGroupDto.Name))
            throw new ValidatorException("Group name is required");

        var group = await _groupRepo.GetGroupByIdAsync(id);
        if (group == null)
            throw new NotFoundException("Group not found");

        await _groupRepo.UpdateAsync(id, updateGroupDto);
        // SaveChangesAsync() đã được gọi trong UpdateAsync()

        return await _groupRepo.GetGroupByIdAsync(id) ??
            throw new NotFoundException("Group not found after update");
    }

    public async Task<IEnumerable<MemberDto>> GetMembersAsync(int groupId)
    {
        if (groupId <= 0)
            throw new ValidatorException("Invalid group ID");

        var group = await _groupRepo.GetGroupByIdAsync(groupId);
        if (group == null)
            throw new NotFoundException("Group not found");

        // Get all members with their user information
        return await _groupRepo.GetMembersAsync(groupId);
    }

    public async Task<IEnumerable<MemberDto>> GetPendingMembersAsync(int groupId)
    {
        if (groupId <= 0)
            throw new ValidatorException("Invalid group ID");

        var group = await _groupRepo.GetGroupByIdAsync(groupId);
        if (group == null)
            throw new NotFoundException("Group not found");

        return await _groupRepo.GetPendingMembersAsync(groupId);
    }

    public async Task<MemberDto> UpdateMemberStatusAsync(int groupId, int userId, MemberStatus newStatus)
    {
        if (groupId <= 0 || userId <= 0)
            throw new ValidatorException("Invalid group ID or user ID");

        var group = await _groupRepo.GetGroupByIdAsync(groupId);
        if (group == null)
            throw new NotFoundException("Group not found");

        var member = await _groupRepo.GetMemberAsync(groupId, userId);
        if (member == null)
            throw new NotFoundException("Member not found in group");

        // Only allow status changes from Pending to Approved/Rejected
        if (member.Status != MemberStatus.Pending)
            throw new ValidatorException("Can only update status for pending memberships");

        member.Status = newStatus;
        await _groupRepo.SaveChangesAsync();

        // Return updated member info
        var user = await _userRepo.GetUserByIdAsync(userId);
        if (user == null)
            throw new NotFoundException("User not found");

        return new MemberDto
        {
            UserId = userId,
            GroupId = groupId,
            Status = newStatus,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email
        };
    }

    public async Task AddMemberAsync(int groupId, int userId)
    {
        if (groupId <= 0 || userId <= 0)
            throw new ValidatorException("Invalid group ID or user ID");

        var group = await _groupRepo.GetGroupByIdAsync(groupId);
        if (group == null)
            throw new NotFoundException("Group not found");

        var user = await _userRepo.GetUserByIdAsync(userId);
        if (user == null)
            throw new NotFoundException("User not found");

        var existingMember = await _groupRepo.GetMemberAsync(groupId, userId);
        if (existingMember != null)
            throw new ValidatorException("User is already a member of this group");

        var member = new Member
        {
            GroupId = groupId,
            UserId = userId,
            Status = MemberStatus.Pending
        };

        await _groupRepo.AddMemberAsync(member);
        await _groupRepo.SaveChangesAsync();
    }

    public async Task<bool> IsMember(int groupId, int userId)
    {
        if (groupId <= 0 || userId <= 0)
            throw new ValidatorException("Invalid group ID or user ID");

        var member = await _groupRepo.GetMemberAsync(groupId, userId);
        return member != null && member.Status == MemberStatus.Approved;
    }

    public async Task<bool> IsOwner(int groupId, int userId)
    {
        if (groupId <= 0 || userId <= 0)
            throw new ValidatorException("Invalid group ID or user ID");

        var group = await _groupRepo.GetGroupByIdAsync(groupId);
        return group?.OwnerId == userId;
    }

    public async Task<Member> JoinGroupAsync(int groupId, int userId)
    {
        if (groupId <= 0 || userId <= 0)
            throw new ValidatorException("Invalid group ID or user ID");

        var group = await _groupRepo.GetGroupByIdAsync(groupId);
        if (group == null)
            throw new NotFoundException("Group not found");

        var existingMember = await _groupRepo.GetMemberAsync(groupId, userId);
        if (existingMember != null)
            throw new ValidatorException("User is already a member of this group");

        var member = new Member
        {
            GroupId = groupId,
            UserId = userId,
            Status = MemberStatus.Pending
        };

        await _groupRepo.AddMemberAsync(member);
        await _groupRepo.SaveChangesAsync();

        return member;
    }

    public async Task LeaveGroupAsync(int groupId, int userId)
    {
        if (groupId <= 0 || userId <= 0)
            throw new ValidatorException("Invalid group ID or user ID");

        var member = await _groupRepo.GetMemberAsync(groupId, userId);
        if (member == null)
            throw new NotFoundException("Member not found in group");

        // Check if user is owner
        var group = await _groupRepo.GetGroupByIdAsync(groupId);
        if (group?.OwnerId == userId)
            throw new ValidatorException("Group owner cannot leave the group. Transfer ownership first.");

        await _groupRepo.RemoveMemberAsync(member);
        await _groupRepo.SaveChangesAsync();
    }

    public async Task<Member> InviteMemberByEmailAsync(int groupId, int inviterId, string email)
    {
        var user = await _userRepo.GetUserByEmailAsync(email);
        if (user == null)
            throw new NotFoundException($"User with email {email} not found");

        var existingMember = await _groupRepo.GetMemberAsync(groupId, user.Id);
        if (existingMember != null)
            throw new ValidatorException($"User {email} is already a member of this group");

        var member = new Member
        {
            GroupId = groupId,
            UserId = user.Id,
            Status = MemberStatus.Approved
        };

        await _groupRepo.AddMemberAsync(member);
        await _groupRepo.SaveChangesAsync();

        // TODO: Send email notification to user

        return member;
    }

    public async Task<GroupQuiz> ShareQuizWithGroupAsync(int groupId, int sharerId, int quizId)
    {
        var quiz = await _quizRepo.GetByIdAsync(quizId);
        if (quiz == null)
            throw new NotFoundException("Quiz not found");

        // Check for existing share in GroupShared
        var existingShare = await _quizRepo.GetSharedQuizWithGroupAsync(quizId, groupId);
        if (existingShare != null)
            throw new ValidatorException("Quiz is already shared with this group");

        // Create entry in GroupShared table
        var groupShared = new GroupShared
        {
            QuizId = quizId,
            GroupId = groupId,
            OwnerId = sharerId
        };

        await _quizRepo.ShareQuizWithGroupAsync(groupShared);


        // Return GroupQuiz object with essential properties
        return new GroupQuiz
        {
            GroupId = groupId,
            QuizId = quizId,
            SharedById = sharerId,
            SharedAt = DateTime.UtcNow
        };
    }

    public async Task<IEnumerable<GroupQuiz>> GetSharedQuizzesAsync(int groupId)
    {
        return await _groupRepo.GetSharedQuizzesAsync(groupId);
    }

    public async Task RemoveSharedQuizAsync(int groupId, int quizId)
    {
        var sharedQuiz = await _groupRepo.GetSharedQuizAsync(groupId, quizId);
        if (sharedQuiz == null)
            throw new NotFoundException("Shared quiz not found");

        await _groupRepo.RemoveSharedQuizAsync(sharedQuiz);
        await _groupRepo.SaveChangesAsync();
    }

    public async Task<ChatMessage> SaveChatMessage(ChatMessage message)
    {
        await _groupRepo.AddChatMessageAsync(message);
        await _groupRepo.SaveChangesAsync();
        return message;
    }

    public async Task<IEnumerable<ChatMessage>> GetGroupChatHistoryAsync(int groupId, int limit = 50)
    {
        return await _groupRepo.GetChatHistoryAsync(groupId, limit);
    }

    public async Task<List<SharedQuizDto>> GetAllSharedQuizzesForUserAsync(int userId)
    {
        // Get all groups where user is a member
        var memberGroups = await _groupRepo.GetMyGroupsAsync(userId);
        if (!memberGroups.Any())
            return new List<SharedQuizDto>();

        // Execute the query and materialize it
        var sharedQuizzes = (await _groupRepo.GetSharedQuizzesAsync(
            memberGroups.Select(g => g.Id).ToList())).ToList();

        return sharedQuizzes
            .OrderByDescending(gq => gq.SharedAt)
            .Select(gq => new SharedQuizDto
            {
                QuizId = gq.QuizId,
                QuizName = gq.Quiz?.Name ?? "",
                Image = gq.Quiz?.Image ?? string.Empty,
                Duration = gq.Quiz?.Duration ?? 0,
                NumberOfQuestions = gq.Quiz?.NumberOfQuestions ?? 0,
                SharedById = gq.SharedById,
                SharedByName = string.Empty, // Remove SharedByName since we don't need user info
                SharedAt = gq.SharedAt,
                Status = gq.Quiz?.Status ?? QuizStatus.Public,
                GroupId = gq.GroupId,
                GroupName = string.Empty // Remove GroupName since we don't need it
            })
            .ToList();
    }
}