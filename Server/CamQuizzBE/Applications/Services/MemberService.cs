namespace CamQuizzBE.Applications.Services;

using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

public class MemberService(IMemberRepository memberRepository)
{
    private readonly IMemberRepository _memberRepository = memberRepository;

    public async Task<IEnumerable<Member>> GetMembersByGroupIdAsync(int groupId)
    {
        return await _memberRepository.GetMembersByGroupIdAsync(groupId);
    }

    public async Task AddMemberAsync(int groupId, int userId)
    {
        var newMember = new Member { GroupId = groupId, UserId = userId };
        await _memberRepository.AddMemberAsync(newMember);
    }

    public async Task RemoveMemberAsync(int groupId, int userId)
    {
        await _memberRepository.RemoveMemberAsync(groupId, userId);
    }
}
