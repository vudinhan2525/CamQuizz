namespace CamQuizzBE.Applications.Services;

using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Domain.Enums;
using CamQuizzBE.Presentation.Exceptions;
using CamQuizzBE.Applications.DTOs.Groups;
using System.Collections.Generic;
using System.Threading.Tasks;

public class GroupService : IGroupService
{
    private readonly IGroupRepository _groupRepo;
    private readonly IUserRepository _userRepo;

    public GroupService(IGroupRepository groupRepo, IUserRepository userRepo)
    {
        _groupRepo = groupRepo ?? throw new ArgumentNullException(nameof(groupRepo));
        _userRepo = userRepo ?? throw new ArgumentNullException(nameof(userRepo));
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

        return group;
    }

   public async Task<GroupDto> CreateGroupAsync(CreateGroupDto groupDto)
{
    if (groupDto == null)
        throw new ArgumentNullException(nameof(groupDto));

    if (groupDto.OwnerId <= 0)
        throw new ValidatorException("Invalid owner ID");

    var owner = await _userRepo.GetUserByIdAsync(groupDto.OwnerId);
    if (owner == null)
        throw new NotFoundException("Owner not found");

    if (string.IsNullOrWhiteSpace(groupDto.Name))
        throw new ValidatorException("Group name is required");

    var group = new Group
    {
        Name = groupDto.Name.Trim(),
        Description = groupDto.Description?.Trim() ?? string.Empty,
        OwnerId = groupDto.OwnerId,
        Status = GroupStatus.Active
    };

    await _groupRepo.AddAsync(group);
    await _groupRepo.SaveChangesAsync(); // Ensure group is persisted before adding member

    // Add owner as first member
    var member = new Member
    {
        GroupId = group.Id,
        UserId = groupDto.OwnerId,
        Status = MemberStatus.Approved // Note: You used Approved here, ensure it’s valid in your enum
    };
    await _groupRepo.AddMemberAsync(member);
    await _groupRepo.SaveChangesAsync();

    // Map to DTO to avoid circular references
    return new GroupDto
    {
        Id = group.Id,
        Name = group.Name,
        Description = group.Description,
        OwnerId = group.OwnerId,
        // OwnerName = owner.FirstName // Assuming User has a FirstName property
    };
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

    public async Task UpdateGroupStatusAsync(int groupId, UpdateGroupStatusDto dto)
    {
        if (groupId <= 0)
            throw new ValidatorException("Invalid group ID");

        if (dto == null)
            throw new ArgumentNullException(nameof(dto));

        var group = await _groupRepo.GetGroupByIdAsync(groupId);
        if (group == null)
            throw new NotFoundException("Group not found");

        await _groupRepo.UpdateStatusAsync(groupId, dto);
        await _groupRepo.SaveChangesAsync();
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

    public async Task UpdateMemberStatusAsync(int groupId, int userId, MemberStatus newStatus)
    {
        if (groupId <= 0 || userId <= 0)
            throw new ValidatorException("Invalid group ID or user ID");

        var group = await _groupRepo.GetGroupByIdAsync(groupId);
        if (group == null)
            throw new NotFoundException("Group not found");

        var member = await _groupRepo.GetMemberAsync(groupId, userId);
        if (member == null)
            throw new NotFoundException("Member not found in group");

        member.Status = newStatus;
        await _groupRepo.SaveChangesAsync();
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
}