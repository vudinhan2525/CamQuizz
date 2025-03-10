namespace CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Domain.Entities;

public interface IMemberRepository
{
    Task<IEnumerable<Member>> GetMembersByGroupIdAsync(int groupId);
    Task<Member?> GetByIdAsync(int groupId, int userId);
    Task AddMemberAsync(Member member);
    Task RemoveMemberAsync(int groupId, int userId);  // <- Fix parameter to match repository logic
}
