namespace CamQuizzBE.Infras.Repositories;

using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Applications.DTOs.Groups;
using CamQuizzBE.Infras.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class GroupRepository(DataContext context) : IGroupRepository
{
    private readonly DataContext _context = context;

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
        if (group != null)
        {
            _context.Groups.Remove(group);
            await _context.SaveChangesAsync();
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

}
