namespace CamQuizzBE.Domain.Repositories;

using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Applications.DTOs.Groups;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface IGroupRepository
{
    Task<IEnumerable<GroupDto>> GetAllGroupsAsync();
    Task<IEnumerable<GroupDto>> GetGroupsAsync(string? search, int page, int pageSize, string? sort);
    Task<IEnumerable<GroupDto>> GetMyGroupsAsync(int userId);
    Task<IEnumerable<GroupDto>> GetMyGroupsAsync(int userId, string? search, int page, int pageSize, string? sort);
    Task<Member?> GetMemberAsync(int groupId, int userId);
    Task<IEnumerable<MemberDto>> GetMembersAsync(int groupId);
    Task<GroupDto?> GetGroupByIdAsync(int id);
    Task AddAsync(Group group);
    Task DeleteAsync(int id);
    Task UpdateAsync(int id, UpdateGroupDto updateGroupDto);
    Task UpdateStatusAsync(int groupId, UpdateGroupStatusDto newStatus);
    Task<IEnumerable<MemberDto>> GetPendingMembersAsync(int groupId);
    Task AddMemberAsync(Member member);
    Task RemoveMemberAsync(Member member);
    Task SaveChangesAsync();

    // Shared quizzes management
    Task<GroupQuiz?> GetSharedQuizAsync(int groupId, int quizId);
    Task<IEnumerable<GroupQuiz>> GetSharedQuizzesAsync(int groupId);
    Task<IEnumerable<GroupQuiz>> GetSharedQuizzesAsync(List<int> groupIds);
    Task AddSharedQuizAsync(GroupQuiz sharedQuiz);
    Task RemoveSharedQuizAsync(GroupQuiz sharedQuiz);

    // Chat functionality
    Task AddChatMessageAsync(ChatMessage message);
    Task<IEnumerable<ChatMessage>> GetChatHistoryAsync(int groupId, int limit);
}

