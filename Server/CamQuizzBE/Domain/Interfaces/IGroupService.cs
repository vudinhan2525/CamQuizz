using CamQuizzBE.Applications.DTOs.Groups;
using CamQuizzBE.Applications.Helpers;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Enums;

namespace CamQuizzBE.Domain.Interfaces;

public interface IGroupService
{
    Task<IEnumerable<GroupDto>> GetAllGroupsAsync();
    Task<IEnumerable<GroupDto>> GetGroupsAsync(string? search, int page, int pageSize, string? sort); // Add this
    Task<IEnumerable<GroupDto>> GetMyGroupsAsync(int userId);
    Task<IEnumerable<GroupDto>> GetMyGroupsAsync(int userId, string? search, int page, int pageSize, string? sort); // Add this
    Task<IEnumerable<GroupDto>> GetMyGroupsAsync(int userId, String status = "Active", bool  isOwner= true );

    Task<GroupDto?> GetGroupByIdAsync(int id);
    Task<GroupDto> CreateGroupAsync(CreateGroupDto groupDto);
    Task DeleteGroupAsync(int id);
    Task<GroupDto> UpdateGroupAsync(int id, UpdateGroupDto updateGroupDto);
    Task UpdateGroupStatusAsync(int groupId, UpdateGroupStatusDto updateGroupStatusDto);

    Task<Member?> GetMemberAsync(int groupId, int userId);
    Task<IEnumerable<MemberDto>> GetMembersAsync(int groupId);
    Task<IEnumerable<MemberDto>> GetPendingMembersAsync(int groupId);
    Task<bool> IsMember(int groupId, int userId);
    Task<bool> IsOwner(int groupId, int userId);
    Task<Member> JoinGroupAsync(int groupId, int userId);
    Task LeaveGroupAsync(int groupId, int userId);
    Task<MemberDto> UpdateMemberStatusAsync(int groupId, int userId, MemberStatus newStatus);

    Task<Member> InviteMemberByEmailAsync(int groupId, int inviterId, string email);

    Task<GroupQuiz> ShareQuizWithGroupAsync(int groupId, int sharerId, int quizId);
    Task<IEnumerable<GroupQuiz>> GetSharedQuizzesAsync(int groupId);
    Task RemoveSharedQuizAsync(int groupId, int quizId);
    Task<ChatMessage> SaveChatMessage(ChatMessage message);
    Task<IEnumerable<ChatMessage>> GetGroupChatHistoryAsync(int groupId, int limit = 50);
    Task<List<SharedQuizDto>> GetAllSharedQuizzesForUserAsync(int userId);
}