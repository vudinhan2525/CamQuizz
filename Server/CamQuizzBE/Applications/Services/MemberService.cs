namespace CamQuizzBE.Applications.Services;

using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

public class MemberService : IMemberService
{
    private readonly IMemberRepository _memberRepository;
    private readonly IGroupRepository _groupRepository;

    public MemberService(IMemberRepository memberRepository, IGroupRepository groupRepository)
    {
        _memberRepository = memberRepository;
        _groupRepository = groupRepository;
    }

    // Get all members in a group
    public async Task<IEnumerable<Member>> GetMembersByGroupIdAsync(int groupId)
    {
        return await _memberRepository.GetMembersByGroupIdAsync(groupId);
    }

    // Member requests to join a group
    public async Task RequestToJoinGroupAsync(int groupId, int userId)
    {
        var group = await _groupRepository.GetGroupByIdAsync(groupId);
        if (group == null) throw new KeyNotFoundException("Group not found.");

        var existingMember = await _memberRepository.GetByIdAsync(groupId, userId);
        if (existingMember != null)
            throw new InvalidOperationException("You have already requested to join this group.");

        var newMember = new Member
        {
            GroupId = groupId,
            UserId = userId,
            // Status = MembershipStatus.Pending
        };
        await _memberRepository.AddMemberAsync(newMember);
    }

    // Owner approves a member request
    public async Task ApproveMemberAsync(int groupId, int userId, int ownerId)
    {
        var group = await _groupRepository.GetGroupByIdAsync(groupId);
        if (group == null || group.OwnerId != ownerId)
            throw new UnauthorizedAccessException("Only the group owner can approve members.");

        var member = await _memberRepository.GetByIdAsync(groupId, userId);
        // if (member == null || member.Status != MembershipStatus.Pending)
        //     throw new InvalidOperationException("No pending request found for this member.");

        await _memberRepository.ApproveMemberAsync(groupId, userId);
    }

    // Member leaves the group
    public async Task LeaveGroupAsync(int groupId, int userId)
    {
        var member = await _memberRepository.GetByIdAsync(groupId, userId);
        if (member == null)
            throw new InvalidOperationException("You are not a member of this group.");

        await _memberRepository.RemoveMemberAsync(groupId, userId);
    }

    // Owner removes a member
    public async Task RemoveMemberAsync(int groupId, int userId, int ownerId)
    {
        var group = await _groupRepository.GetGroupByIdAsync(groupId);
        if (group == null || group.OwnerId != ownerId)
            throw new UnauthorizedAccessException("Only the group owner can remove members.");

        await _memberRepository.RemoveMemberAsync(groupId, userId);
    }
}
