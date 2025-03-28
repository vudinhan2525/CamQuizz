namespace CamQuizzBE.Domain.Interfaces;

using CamQuizzBE.Applications.DTOs.Groups; // Add this for MemberDto
using CamQuizzBE.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface IMemberService
{
    Task<IEnumerable<MemberDto>> GetMembersByGroupIdAsync(int groupId);
    Task<IEnumerable<Member>> GetPendingMembersAsync(int groupId);
    Task<IEnumerable<Member>> GetApprovedMembersAsync(int groupId);
    Task<bool> IsUserMemberAsync(int groupId, int userId);
    Task RequestToJoinGroupAsync(int groupId, int userId);
    Task ApproveMemberAsync(int groupId, int userId, int ownerId);
    Task RejectMemberAsync(int groupId, int userId, int ownerId);
    Task LeaveGroupAsync(int groupId, int userId);
    Task RemoveMemberAsync(int groupId, int userId, int ownerId);
}