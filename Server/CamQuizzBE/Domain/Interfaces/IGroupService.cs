namespace CamQuizzBE.Domain.Interfaces;

using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Enums;
using CamQuizzBE.Applications.DTOs.Groups;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface IGroupService
{
    Task<IEnumerable<GroupDto>> GetAllGroupsAsync();
    Task<IEnumerable<GroupDto>> GetMyGroupsAsync(int userId);
    Task<GroupDto?> GetGroupByIdAsync(int id);
    Task<GroupDto> CreateGroupAsync(CreateGroupDto groupDto);
    Task DeleteGroupAsync(int id);
    Task<GroupDto> UpdateGroupAsync(int id, UpdateGroupDto updateGroupDto);
    Task UpdateGroupStatusAsync(int groupId, UpdateGroupStatusDto newStatus);
    Task<IEnumerable<MemberDto>> GetPendingMembersAsync(int groupId);
    Task UpdateMemberStatusAsync(int groupId, int userId, MemberStatus newStatus);
    Task AddMemberAsync(int groupId, int userId);
}
