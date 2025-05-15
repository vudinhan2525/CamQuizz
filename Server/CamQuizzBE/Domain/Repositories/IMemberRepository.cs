namespace CamQuizzBE.Domain.Repositories;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Enums;

public interface IMemberRepository
{
    Task<IEnumerable<Member>> GetMembersByGroupIdAsync(int groupId);
    Task<Member?> GetByIdAsync(int groupId, int userId);
    Task AddMemberAsync(Member member);
    Task RemoveMemberAsync(int groupId, int userId);
    Task ApproveMemberAsync(int groupId, int userId);
    Task RejectMemberAsync(int groupId, int userId);
    Task<IEnumerable<Member>> GetPendingMembersAsync(int groupId);
    Task<IEnumerable<Member>> GetApprovedMembersAsync(int groupId);
    Task<bool> IsMemberExistsAsync(int groupId, int userId);
    Task UpdateMemberStatusAsync(int groupId, int userId, MemberStatus status);
    Task SaveChangesAsync();
}
