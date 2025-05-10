namespace CamQuizzBE.Infras.Repositories;

using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Domain.Enums;
using CamQuizzBE.Infras.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

public class MemberRepository : IMemberRepository
{
    private readonly DataContext _context;

    public MemberRepository(DataContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Member>> GetMembersByGroupIdAsync(int groupId)
    {
        return await _context.Members
            .Where(m => m.GroupId == groupId)
            .Include(m => m.User)
            .ToListAsync();
    }

    public async Task<Member?> GetByIdAsync(int groupId, int userId)
    {
        return await _context.Members
            .FirstOrDefaultAsync(m => m.GroupId == groupId && m.UserId == userId);
    }

    public async Task<bool> IsMemberExistsAsync(int groupId, int userId)
    {
        return await _context.Members
            .AnyAsync(m => m.GroupId == groupId && m.UserId == userId);
    }

    public async Task AddMemberAsync(Member member)
    {
        await _context.Members.AddAsync(member);
    }

    public async Task RemoveMemberAsync(int groupId, int userId)
    {
        var member = await GetByIdAsync(groupId, userId);
        if (member != null)
        {
            _context.Members.Remove(member);
        }
    }

    public async Task ApproveMemberAsync(int groupId, int userId)
    {
        var member = await GetByIdAsync(groupId, userId);
        if (member != null)
        {
            member.Status = MemberStatus.Approved;
        }
    }

    public async Task RejectMemberAsync(int groupId, int userId)
    {
        var member = await GetByIdAsync(groupId, userId);
        if (member != null)
        {
            member.Status = MemberStatus.Rejected;
        }
    }

    public async Task<IEnumerable<Member>> GetPendingMembersAsync(int groupId)
    {
        return await _context.Members
            .Where(m => m.GroupId == groupId && m.Status == MemberStatus.Pending)
            .Include(m => m.User)
            .ToListAsync();
    }

    public async Task<IEnumerable<Member>> GetApprovedMembersAsync(int groupId)
    {
        return await _context.Members
            .Where(m => m.GroupId == groupId && m.Status == MemberStatus.Approved)
            .Include(m => m.User)
            .ToListAsync();
    }

    public async Task UpdateMemberStatusAsync(int groupId, int userId, MemberStatus status)
    {
        var member = await GetByIdAsync(groupId, userId);
        if (member != null)
        {
            member.Status = status;
        }
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
