namespace CamQuizzBE.Infras.Repositories;

using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Applications.DTOs.Groups;
using CamQuizzBE.Infras.Data;
using CamQuizzBE.Domain.Enums; 
using CamQuizzBE.Presentation.Exceptions;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class GroupRepository(DataContext context) : IGroupRepository
{
    private readonly DataContext _context = context;

    public async Task<Member?> GetMemberAsync(int groupId, int userId)
    {
        return await _context.Members
            .FirstOrDefaultAsync(m => m.GroupId == groupId && m.UserId == userId);
    }

    public async Task AddMemberAsync(Member member)
    {
        await _context.Members.AddAsync(member);
        await _context.SaveChangesAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<GroupDto>> GetMyGroupsAsync(int userId)
    {
        return await _context.Groups
            .Where(g => g.OwnerId == userId || g.Members.Any(m => m.UserId == userId))
            .Select(g => new GroupDto
            {
                Id = g.Id,
                Name = g.Name,
                OwnerId = g.OwnerId
            })
            .ToListAsync();
    }

    public async Task<GroupDto?> GetGroupByIdAsync(int id)
    {
        return await _context.Groups
            .Where(g => g.Id == id)
            .Select(g => new GroupDto
            {
                Id = g.Id,
                Name = g.Name,
                OwnerId = g.OwnerId,
                MemberIds = g.Members.Select(m => m.UserId).ToList() // Only return member IDs
            })
            .FirstOrDefaultAsync();
    }


    public async Task AddAsync(Group group)
    {
        await _context.Groups.AddAsync(group);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var group = await _context.Groups.FindAsync(id);
        if (group != null && group.Status == GroupStatus.OnHold)
        {
            _context.Groups.Remove(group);
            await _context.SaveChangesAsync();
        }
        else if (group != null && group.Status != GroupStatus.OnHold)
        {
            throw new ValidatorException("Can only delete groups that are in OnHold status");
        }
    }
    public async Task UpdateStatusAsync(int groupId, UpdateGroupStatusDto newStatus)
    {
        var group = await _context.Groups.FindAsync(groupId);
        if (group != null)
        {
            group.Status = newStatus.Status; // Extract Status from DTO
            await _context.SaveChangesAsync();
        }
    }
    public async Task<IEnumerable<MemberDto>> GetPendingMembersAsync(int groupId)
    {
        return await _context.Members 
            .Where(gm => gm.GroupId == groupId && gm.Status == MemberStatus.Pending) 
            .Select(gm => new MemberDto
            {
                UserId = gm.UserId,
                GroupId = gm.GroupId,
                Status = gm.Status
            })
            .ToListAsync();
    }
}
