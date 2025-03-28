namespace CamQuizzBE.Applications.Services;

using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Domain.Enums;
using CamQuizzBE.Applications.DTOs.Groups;
using System.Collections.Generic;
using System.Threading.Tasks;

public class MemberService : IMemberService
{
    private readonly IMemberRepository _memberRepository;
    private readonly IGroupRepository _groupRepository;

    public MemberService(IMemberRepository memberRepository, IGroupRepository groupRepository)
    {
        _memberRepository = memberRepository ?? throw new ArgumentNullException(nameof(memberRepository));
        _groupRepository = groupRepository ?? throw new ArgumentNullException(nameof(groupRepository));
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
        var members = await _memberRepository.GetMembersByGroupIdAsync(groupId);
        return members.Select(m => new MemberDto
        {
    
            GroupId = m.GroupId,
            UserId = m.UserId,
            JoinedAt = m.JoinedAt, // Assuming Member has this property
            Status = m.Status
        });
    }

    public async Task<IEnumerable<Member>> GetPendingMembersAsync(int groupId)
    {
        await ValidateGroupAndStatus(groupId);
        return await _memberRepository.GetPendingMembersAsync(groupId);
    }

    public async Task<IEnumerable<Member>> GetApprovedMembersAsync(int groupId)
    {
        await ValidateGroupAndStatus(groupId);
        return await _memberRepository.GetApprovedMembersAsync(groupId);
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

    // Owner approves a member request
    public async Task ApproveMemberAsync(int groupId, int userId, int ownerId)
    {
        await ValidateGroupAndStatus(groupId);
        
        var group = await _groupRepository.GetGroupByIdAsync(groupId);
        if (group.OwnerId != ownerId)
            throw new UnauthorizedAccessException("Only the group owner can approve members.");

        var member = await _memberRepository.GetByIdAsync(groupId, userId);
        if (member == null || member.Status != MemberStatus.Pending)
            throw new InvalidOperationException("No pending request found for this member.");

        await _memberRepository.UpdateMemberStatusAsync(groupId, userId, MemberStatus.Approved);
        await _memberRepository.SaveChangesAsync();
    }

    // Owner rejects a member request
    public async Task RejectMemberAsync(int groupId, int userId, int ownerId)
    {
        await ValidateGroupAndStatus(groupId);
        
        var group = await _groupRepository.GetGroupByIdAsync(groupId);
        if (group.OwnerId != ownerId)
            throw new UnauthorizedAccessException("Only the group owner can reject members.");

        var member = await _memberRepository.GetByIdAsync(groupId, userId);
        if (member == null || member.Status != MemberStatus.Pending)
            throw new InvalidOperationException("No pending request found for this member.");

        await _memberRepository.UpdateMemberStatusAsync(groupId, userId, MemberStatus.Rejected);
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

    // Owner removes a member
    public async Task RemoveMemberAsync(int groupId, int userId, int ownerId)
    {
        await ValidateGroupAndStatus(groupId);
        
        var group = await _groupRepository.GetGroupByIdAsync(groupId);
        if (group.OwnerId != ownerId)
            throw new UnauthorizedAccessException("Only the group owner can remove members.");
        if (userId == ownerId)
            throw new InvalidOperationException("Group owner cannot be removed.");

        var member = await _memberRepository.GetByIdAsync(groupId, userId);
        if (member == null)
            throw new InvalidOperationException("User is not a member of this group.");
        if (member.Status != MemberStatus.Approved)
            throw new InvalidOperationException("Only approved members can be removed.");

        await _memberRepository.RemoveMemberAsync(groupId, userId);
        await _memberRepository.SaveChangesAsync();
    }
}
