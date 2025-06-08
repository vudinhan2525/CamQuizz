namespace CamQuizzBE.Infras.Repositories;

using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Domain.Repositories;
using CamQuizzBE.Applications.DTOs.Groups;
using CamQuizzBE.Infras.Data;
using CamQuizzBE.Domain.Enums;
using CamQuizzBE.Presentation.Exceptions;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class GroupRepository(DataContext context, ILogger<GroupRepository> logger) : IGroupRepository
{
    private readonly DataContext _context = context;
    private readonly ILogger<GroupRepository> _logger = logger;
    public async Task<IEnumerable<GroupDto>> GetAllGroupsAsync()
    {
        return await _context.Groups
            .Include(g => g.Members)
                .ThenInclude(m => m.User)
            .Select(g => new GroupDto
            {
                Id = g.Id,
                Name = g.Name,
                Description = g.Description,
                OwnerId = g.OwnerId,
                Status = g.Status,
                CreatedAt = g.CreatedAt,
                UpdatedAt = g.UpdatedAt,
                Members = g.Members.Select(m => new MemberDto
                {
                    UserId = m.UserId,
                    GroupId = m.GroupId,
                    Status = m.Status,
                    JoinedAt = m.JoinedAt,
                    FirstName = m.User.FirstName,
                    LastName = m.User.LastName,
                    Email = m.User.Email
                }).ToList()
            })
            .AsNoTracking()
            .ToListAsync();
    }
    public async Task<IEnumerable<GroupDto>> GetMyGroupsAsync(int userId, String status = "Active", bool isOwner= true ){
        if (!Enum.TryParse<GroupStatus>(status, true, out var parsedStatus))
        {
            throw new ArgumentException($"Trạng thái không hợp lệ: {status}");
        }

        IQueryable<Group> query;
        _logger.LogInformation("User ID: {UserId}, Status: {ParsedStatus}, IsOwner: {IsOwner}", userId, parsedStatus, isOwner);
        if (isOwner)
        {
            query = _context.Groups
                .Where(g => g.OwnerId == userId && g.Status == parsedStatus);
        }
        else
        {
            query = _context.Groups
                .Where(g => g.Members.Any(m => m.UserId == userId) && g.Status == parsedStatus);
        }

        var groups = await query
            .Include(g => g.Members)
                .ThenInclude(m => m.User)
            .AsNoTracking()
            .ToListAsync();

        return groups.Select(g => new GroupDto
        {
            Id = g.Id,
            Name = g.Name,
            Description = g.Description,
            OwnerId = g.OwnerId,
            Status = g.Status,
            CreatedAt = g.CreatedAt,
            UpdatedAt = g.UpdatedAt,
            Members = g.Members.Where(m => m.User != null).Select(m => new MemberDto
            {
                UserId = m.UserId,
                GroupId = m.GroupId,
                Status = m.Status,
                JoinedAt = m.JoinedAt,
                FirstName = m.User.FirstName,
                LastName = m.User.LastName,
                Email = m.User.Email
            }).ToList()
        }).ToList();
    }

    public async Task<IEnumerable<GroupDto>> GetGroupsAsync(string? search, int page, int pageSize, string? sort)
    {
        if (page <= 0 || pageSize <= 0)
            throw new ValidatorException("Invalid pagination parameters");

        var query = _context.Groups.AsQueryable();

        // Apply search filter
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(g => g.Name.Contains(search) || g.Description.Contains(search));
        }

        // Apply sorting
        query = sort?.ToLower() switch
        {
            "name" => query.OrderBy(g => g.Name),
            "createdat" => query.OrderBy(g => g.CreatedAt),
            "-name" => query.OrderByDescending(g => g.Name),
            "-createdat" => query.OrderByDescending(g => g.CreatedAt),
            _ => query.OrderBy(g => g.Id)
        };

        // Apply pagination
        var pagedQuery = query.Skip((page - 1) * pageSize).Take(pageSize);

        return await pagedQuery
            .Include(g => g.Members)
                .ThenInclude(m => m.User)
            .Select(g => new GroupDto
            {
                Id = g.Id,
                Name = g.Name,
                Description = g.Description,
                OwnerId = g.OwnerId,
                Status = g.Status,
                CreatedAt = g.CreatedAt,
                UpdatedAt = g.UpdatedAt,
                Members = g.Members.Select(m => new MemberDto
                {
                    UserId = m.UserId,
                    GroupId = m.GroupId,
                    Status = m.Status,
                    JoinedAt = m.JoinedAt,
                    FirstName = m.User.FirstName,
                    LastName = m.User.LastName,
                    Email = m.User.Email
                }).ToList()
            })
            .AsNoTracking()
            .ToListAsync();
    }
    public async Task<Member?> GetMemberAsync(int groupId, int userId)
    {
        return await _context.Members
            .Include(m => m.User)
            .FirstOrDefaultAsync(m => m.GroupId == groupId && m.UserId == userId);
    }

    public async Task AddMemberAsync(Member member)
    {
        await _context.Members.AddAsync(member);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<GroupDto>> GetMyGroupsAsync(int userId)
    {
        var groups = await _context.Groups
            .Where(g => g.OwnerId == userId || g.Members.Any(m => m.UserId == userId))
            .Include(g => g.Members)
                .ThenInclude(m => m.User)
            .AsNoTracking()
            .ToListAsync();

        return groups.Select(g => new GroupDto
        {
            Id = g.Id,
            Name = g.Name,
            Description = g.Description,
            OwnerId = g.OwnerId,
            Status = g.Status,
            CreatedAt = g.CreatedAt,
            UpdatedAt = g.UpdatedAt,
            Members = g.Members.Where(m => m.User != null).Select(m => new MemberDto
            {
                UserId = m.UserId,
                GroupId = m.GroupId,
                Status = m.Status,
                JoinedAt = m.JoinedAt,
                FirstName = m.User.FirstName,
                LastName = m.User.LastName,
                Email = m.User.Email
            }).ToList()
        }).ToList();
    }

    public async Task<IEnumerable<GroupDto>> GetMyGroupsAsync(int userId, string? search, int page, int pageSize, string? sort)
    {
        if (page <= 0 || pageSize <= 0)
            throw new ValidatorException("Invalid pagination parameters");
        _logger.LogInformation("here1");

        var query = _context.Groups
            .Where(g => g.OwnerId == userId || g.Members.Any(m => m.UserId == userId))
            .AsQueryable();

        // Apply search filter
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(g => g.Name.Contains(search) || g.Description.Contains(search));
        }
        _logger.LogInformation("here2");
        // Apply sorting
        if (!string.IsNullOrWhiteSpace(sort))
        {
            query = sort.ToLower() switch
            {
                "name" => query.OrderBy(g => g.Name),
                "createdat" => query.OrderBy(g => g.CreatedAt),
                "-name" => query.OrderByDescending(g => g.Name),
                "-createdat" => query.OrderByDescending(g => g.CreatedAt),
                _ => query.OrderBy(g => g.Id)
            };
        }
        else
        {
            query = query.OrderBy(g => g.Id);
        }
        _logger.LogInformation("here3");

        // Apply pagination
        query = query.Skip((page - 1) * pageSize).Take(pageSize);

        var groups = await query
            .Include(g => g.Members)
                .ThenInclude(m => m.User)
            .AsNoTracking()
            .ToListAsync();
        _logger.LogInformation("here4");

        return groups.Select(g => new GroupDto
        {
            Id = g.Id,
            Name = g.Name,
            Description = g.Description,
            OwnerId = g.OwnerId,
            Status = g.Status,
            CreatedAt = g.CreatedAt,
            UpdatedAt = g.UpdatedAt,
            Members = g.Members.Where(m => m.User != null).Select(m => new MemberDto
            {
                UserId = m.UserId,
                GroupId = m.GroupId,
                Status = m.Status,
                JoinedAt = m.JoinedAt,
                FirstName = m.User.FirstName,
                LastName = m.User.LastName,
                Email = m.User.Email
            }).ToList()
        }).ToList();
    }
    public async Task<GroupDto?> GetGroupByIdAsync(int id)
    {
        var group = await _context.Groups
            .Include(g => g.Owner)
            .Include(g => g.Members)
                .ThenInclude(m => m.User)
            .Where(g => g.Id == id)
            .FirstOrDefaultAsync();

        if (group == null)
            return null;

        return new GroupDto
        {
            Id = group.Id,
            Name = group.Name,
            Description = group.Description,
            OwnerId = group.OwnerId,
            Status = group.Status,
            CreatedAt = group.CreatedAt,
            UpdatedAt = group.UpdatedAt,
            Members = group.Members.Where(m => m.User != null).Select(m => new MemberDto
            {
                UserId = m.UserId,
                GroupId = m.GroupId,
                Status = m.Status,
                JoinedAt = m.JoinedAt,
                FirstName = m.User.FirstName,
                LastName = m.User.LastName,
                Email = m.User.Email
            }).ToList()
        };
    }


    public async Task AddAsync(Group group)
    {
        await _context.Groups.AddAsync(group);
    }

    public async Task DeleteAsync(int id)
    {
        var group = await _context.Groups.FindAsync(id);
        if (group != null && group.Status == GroupStatus.OnHold)
        {
            _context.Groups.Remove(group);
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
            group.Status = newStatus.Status;
        }
    }

    public async Task UpdateAsync(int id, UpdateGroupDto updateGroupDto)
    {
        var group = await _context.Groups.FindAsync(id);
        if (group == null)
            throw new NotFoundException($"Group with ID {id} not found");

        group.Name = updateGroupDto.Name;
        group.Description = updateGroupDto.Description;

        // Lưu thay đổi vào database
        await _context.SaveChangesAsync();
    }
    public async Task<IEnumerable<MemberDto>> GetMembersAsync(int groupId)
    {
        var members = await _context.Members
            .Include(m => m.User)
            .Where(m => m.GroupId == groupId && m.User != null)
            .ToListAsync();

        return members.Select(m => new MemberDto
        {
            UserId = m.UserId,
            GroupId = m.GroupId,
            FirstName = m.User.FirstName,
            LastName = m.User.LastName,
            Email = m.User.Email,
            Status = m.Status,
            JoinedAt = m.JoinedAt
        }).ToList();
    }

    public Task RemoveMemberAsync(Member member)
    {
        _context.Members.Remove(member);
        return Task.CompletedTask;
    }

    public async Task<IEnumerable<MemberDto>> GetPendingMembersAsync(int groupId)
    {
        var members = await _context.Members
            .Include(m => m.User)
            .Where(gm => gm.GroupId == groupId && gm.Status == MemberStatus.Pending && gm.User != null)
            .ToListAsync();

        return members.Select(gm => new MemberDto
        {
            UserId = gm.UserId,
            GroupId = gm.GroupId,
            FirstName = gm.User.FirstName,
            LastName = gm.User.LastName,
            Email = gm.User.Email,
            Status = gm.Status,
            JoinedAt = gm.JoinedAt
        }).ToList();
    }

    // Shared quizzes management
    public async Task<GroupQuiz?> GetSharedQuizAsync(int groupId, int quizId)
    {
        return await _context.GroupQuizzes
            .FirstOrDefaultAsync(gq => gq.GroupId == groupId && gq.QuizId == quizId);
    }

    public async Task<IEnumerable<GroupQuiz>> GetSharedQuizzesAsync(int groupId)
    {
        var sharedQuizzes = await _context.GroupShared
            .Include(gs => gs.Quiz)
            .Where(gs => gs.GroupId == groupId)
            .Select(gs => new GroupQuiz
            {
                GroupId = gs.GroupId,
                QuizId = gs.QuizId,
                Quiz = gs.Quiz,
                SharedById = gs.OwnerId,
                SharedAt = DateTime.UtcNow
            })
            .OrderByDescending(gq => gq.SharedAt)
            .ToListAsync();

        return sharedQuizzes.Where(gq => gq.Quiz != null).ToList();
    }

    public async Task<IEnumerable<GroupQuiz>> GetSharedQuizzesAsync(List<int> groupIds)
    {
        var sharedQuizzes = await _context.GroupShared
            .Include(gs => gs.Quiz)
            .Where(gs => groupIds.Contains(gs.GroupId))
            .Select(gs => new GroupQuiz
            {
                GroupId = gs.GroupId,
                QuizId = gs.QuizId,
                Quiz = gs.Quiz,
                SharedById = gs.OwnerId,
                SharedAt = DateTime.UtcNow
            })
            .OrderByDescending(gq => gq.SharedAt)
            .ToListAsync();

        return sharedQuizzes.Where(gq => gq.Quiz != null).ToList();
    }

    public async Task AddSharedQuizAsync(GroupQuiz sharedQuiz)
    {
        await _context.GroupQuizzes.AddAsync(sharedQuiz);
    }

    public Task RemoveSharedQuizAsync(GroupQuiz sharedQuiz)
    {
        ArgumentNullException.ThrowIfNull(sharedQuiz);
        _context.GroupQuizzes.Remove(sharedQuiz);
        return Task.CompletedTask;
    }

    public async Task AddChatMessageAsync(ChatMessage message)
    {
        await _context.ChatMessages.AddAsync(message);
    }

    public async Task<IEnumerable<ChatMessage>> GetChatHistoryAsync(int groupId, int limit)
    {
        return await _context.ChatMessages
            .Include(m => m.User)
            .Where(m => m.GroupId == groupId)
            .OrderByDescending(m => m.SentAt)
            .Take(limit)
            .OrderBy(m => m.SentAt) // Re-order chronologically after taking the latest messages
            .ToListAsync();
    }
}
