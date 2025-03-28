using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Domain.Enums;
using CamQuizzBE.Infras.Data;
using Microsoft.EntityFrameworkCore;

namespace CamQuizzBE.Infras.Repositories;

public class MemberRepository(DataContext context) : IMemberRepository
{
    private readonly DataContext _context = context;

    public async Task<IEnumerable<Member>> GetMembersByGroupIdAsync(int groupId)
    {
        return await _context.Members
            .Where(m => m.GroupId == groupId)
            .ToListAsync();
    }

    public async Task<Member?> GetByIdAsync(int groupId, int userId)
    {
        return await _context.Members
            .FirstOrDefaultAsync(m => m.GroupId == groupId && m.UserId == userId);
    }

    public async Task AddMemberAsync(Member member)
    {
        member.Status = MemberStatus.Pending; // Ensure all new members start as Pending
        await _context.Members.AddAsync(member);
        await _context.SaveChangesAsync();
    }

    public async Task RemoveMemberAsync(int groupId, int userId)
    {
        var member = await GetByIdAsync(groupId, userId);
        if (member != null)
        {
            _context.Members.Remove(member);
            await _context.SaveChangesAsync();
        }
    }

    public async Task ApproveMemberAsync(int groupId, int userId)
    {
        var member = await _context.Members
            .FirstOrDefaultAsync(m => m.GroupId == groupId && m.UserId == userId);
        if (member != null)
        {
            member.Status = MemberStatus.Approved;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<Member>> GetPendingMembersAsync(int groupId)
    {
        return await _context.Members
            .Where(m => m.GroupId == groupId && m.Status == MemberStatus.Pending)
            .ToListAsync();
    }
}
