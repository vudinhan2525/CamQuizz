namespace CamQuizzBE.Applications.Services;

using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Domain.Repositories;
using CamQuizzBE.Domain.Enums;
using CamQuizzBE.Presentation.Exceptions;
using CamQuizzBE.Applications.DTOs.Groups;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

public class MemberService : IMemberService
{
    private readonly IMemberRepository _memberRepository;
    private readonly IGroupRepository _groupRepository;
    private readonly IUserRepository _userRepository;

    public MemberService(IMemberRepository memberRepository, IGroupRepository groupRepository, IUserRepository userRepository)
    {
        _memberRepository = memberRepository ?? throw new ArgumentNullException(nameof(memberRepository));
        _groupRepository = groupRepository ?? throw new ArgumentNullException(nameof(groupRepository));
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
    }

    private async Task ValidateGroupAndStatus(int groupId)
    {
        var group = await _groupRepository.GetGroupByIdAsync(groupId);
        if (group == null) throw new KeyNotFoundException("Group not found.");
        if (group.Status != GroupStatus.Active)
            throw new InvalidOperationException("Cannot modify members of inactive groups.");
    }

    public async Task<bool> IsUserMemberAsync(int groupId, int userId)
    {
        return await _memberRepository.IsMemberExistsAsync(groupId, userId);
    }

    public async Task<bool> IsUserApprovedMemberAsync(int groupId, int userId)
    {
        var member = await _memberRepository.GetByIdAsync(groupId, userId);
        return member?.Status == MemberStatus.Approved;
    }

    public async Task<IEnumerable<MemberDto>> GetMembersByGroupIdAsync(int groupId)
    {
        await ValidateGroupAndStatus(groupId);

        // Get all members
        var members = (await _memberRepository.GetMembersByGroupIdAsync(groupId)).ToList();
        
        // Get group details
        var group = await _groupRepository.GetGroupByIdAsync(groupId);
        if (group == null)
            throw new KeyNotFoundException("Group not found");

        // Add owner as approved member if not already in the list
        if (!members.Any(m => m.UserId == group.OwnerId))
        {
            var owner = await _userRepository.GetUserByIdAsync(group.OwnerId);
            if (owner != null)
            {
                members.Add(new Member
                {
                    GroupId = groupId,
                    UserId = group.OwnerId,
                    Status = MemberStatus.Approved,
                    JoinedAt = group.CreatedAt,
                    User = owner
                });
            }
        }

        // Convert to DTOs and order by status (Owner and Approved first, then Pending)
        return members
            .OrderBy(m => m.UserId != group.OwnerId) // Owner first
            .ThenBy(m => m.Status != MemberStatus.Approved) // Then approved members
            .ThenBy(m => m.JoinedAt) // Then by join date
            .Select(m => new MemberDto
            {
                GroupId = m.GroupId,
                UserId = m.UserId,
                Email = m.User?.Email ?? string.Empty,
                FirstName = m.User?.FirstName ?? string.Empty,
                LastName = m.User?.LastName ?? string.Empty,
                JoinedAt = m.JoinedAt,
                Status = m.Status
            });
    }

    public async Task<IEnumerable<MemberDto>> GetPendingMembersAsync(int groupId)
    {
        await ValidateGroupAndStatus(groupId);
        var members = await _memberRepository.GetPendingMembersAsync(groupId);
        return members.Select(m => new MemberDto
        {
            GroupId = m.GroupId,
            UserId = m.UserId,
            Email = m.User?.Email ?? string.Empty,
            FirstName = m.User?.FirstName ?? string.Empty,
            LastName = m.User?.LastName ?? string.Empty,
            JoinedAt = m.JoinedAt,
            Status = m.Status
        });
    }

    // Member requests to join a group
    public async Task RequestToJoinGroupAsync(int groupId, int userId)
    {
        await ValidateGroupAndStatus(groupId);

        var existingMember = await _memberRepository.GetByIdAsync(groupId, userId);
        if (existingMember != null)
        {
            if (existingMember.Status == MemberStatus.Rejected)
                await _memberRepository.UpdateMemberStatusAsync(groupId, userId, MemberStatus.Pending);
            else
                throw new InvalidOperationException("You have already requested to join this group.");
            return;
        }

        var newMember = new Member
        {
            GroupId = groupId,
            UserId = userId,
            Status = MemberStatus.Pending
        };
        await _memberRepository.AddMemberAsync(newMember);
        await _memberRepository.SaveChangesAsync();
    }

    public async Task UpdateMemberStatusAsync(int groupId, int userId, int ownerId, MemberStatus newStatus)
    {
        await ValidateGroupAndStatus(groupId);
        
        var group = await _groupRepository.GetGroupByIdAsync(groupId);
        if (group == null)
            throw new NotFoundException("Group not found");
            
        if (group.OwnerId != ownerId)
            throw new UnauthorizedAccessException("Only the group owner can update member status.");

        var member = await _memberRepository.GetByIdAsync(groupId, userId);
        if (member == null)
            throw new NotFoundException("Member not found");

        // Validate status transitions
        bool isValidTransition = (member.Status, newStatus) switch
        {
            (MemberStatus.Pending, MemberStatus.Approved) => true,
            (MemberStatus.Pending, MemberStatus.Rejected) => true,
            (MemberStatus.Rejected, MemberStatus.Pending) => true,
            (MemberStatus.Approved, MemberStatus.Rejected) => true,
            _ => false
        };

        if (!isValidTransition)
            throw new InvalidOperationException($"Invalid status transition from {member.Status} to {newStatus}");

        await _memberRepository.UpdateMemberStatusAsync(groupId, userId, newStatus);
        await _memberRepository.SaveChangesAsync();
    }

    // Member leaves the group
    public async Task LeaveGroupAsync(int groupId, int userId)
    {
        var group = await _groupRepository.GetGroupByIdAsync(groupId);
        if (group == null) throw new KeyNotFoundException("Group not found.");
        if (group.OwnerId == userId)
            throw new InvalidOperationException("Group owner cannot leave the group.");

        var member = await _memberRepository.GetByIdAsync(groupId, userId);
        if (member == null)
            throw new InvalidOperationException("You are not a member of this group.");
        if (member.Status != MemberStatus.Approved)
            throw new InvalidOperationException("Only approved members can leave the group.");

        await _memberRepository.RemoveMemberAsync(groupId, userId);
        await _memberRepository.SaveChangesAsync();
    }

    // Owner removes a member by setting status to Rejected
    public async Task RemoveMemberAsync(int groupId, int userId, int ownerId)
    {
        // We'll reuse our status update logic but enforce Rejected status
        await UpdateMemberStatusAsync(groupId, userId, ownerId, MemberStatus.Rejected);
    }
}
