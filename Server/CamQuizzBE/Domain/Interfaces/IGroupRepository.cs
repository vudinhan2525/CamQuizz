namespace CamQuizzBE.Domain.Interfaces;

using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Applications.DTOs.Groups;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface IGroupRepository
{
    Task<IEnumerable<GroupDto>> GetMyGroupsAsync(int userId);
    Task<GroupDto?> GetGroupByIdAsync(int id);
    Task AddAsync(Group group);
    Task DeleteAsync(int id);
}
