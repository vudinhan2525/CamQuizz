namespace CamQuizzBE.Domain.Interfaces;

using CamQuizzBE.Applications.DTOs.Groups;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Enums;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface IMemberService
{
    Task<IEnumerable<MemberDto>> GetMembersByGroupIdAsync(int groupId);
    Task<IEnumerable<MemberDto>> GetPendingMembersAsync(int groupId);
    Task<bool> IsUserMemberAsync(int groupId, int userId);
    Task RequestToJoinGroupAsync(int groupId, int userId);
    Task UpdateMemberStatusAsync(int groupId, int userId, int ownerId, MemberStatus newStatus);
    Task LeaveGroupAsync(int groupId, int userId);
    Task RemoveMemberAsync(int groupId, int userId, int ownerId);
}