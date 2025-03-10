namespace CamQuizzBE.Applications.Services;

using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Infras.Repositories;
using CamQuizzBE.Applications.DTOs.Groups;
using System.Collections.Generic;
using System.Threading.Tasks;

public class GroupService
{
    private readonly IGroupRepository _groupRepo;

    public GroupService(IGroupRepository groupRepo)
    {
        _groupRepo = groupRepo;
    }

    public async Task<IEnumerable<GroupDto>> GetMyGroupsAsync(int userId)
    {
        return await _groupRepo.GetMyGroupsAsync(userId);
    }

    public async Task<GroupDto?> GetGroupByIdAsync(int id)
    {
        return await _groupRepo.GetGroupByIdAsync(id);
    }

    public async Task<Group> CreateGroupAsync(CreateGroupDto groupDto)
    {
        var group = new Group
        {
            Name = groupDto.Name,
            Description = groupDto.Description,
            OwnerId = groupDto.OwnerId
        };

        await _groupRepo.AddAsync(group);
        return group;
    }


    public async Task DeleteGroupAsync(int id)
    {
        await _groupRepo.DeleteAsync(id);
    }
}
