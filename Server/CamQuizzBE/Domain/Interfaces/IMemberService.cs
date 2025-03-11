namespace CamQuizzBE.Domain.Interfaces;

using CamQuizzBE.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface IMemberService
{
    Task<IEnumerable<Member>> GetMembersByGroupIdAsync(int groupId);
    Task RequestToJoinGroupAsync(int groupId, int userId);
    Task ApproveMemberAsync(int groupId, int userId, int ownerId);
    Task LeaveGroupAsync(int groupId, int userId);
    Task RemoveMemberAsync(int groupId, int userId, int ownerId);
}
