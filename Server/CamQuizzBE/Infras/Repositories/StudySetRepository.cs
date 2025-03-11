using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Applications.DTOs.StudySets;
using CamQuizzBE.Infras.Data;
using Microsoft.EntityFrameworkCore;

namespace CamQuizzBE.Infras.Repositories
{
    public class StudySetRepository : IStudySetRepository
    {
        private readonly DataContext _context;

        public StudySetRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<StudySetDto>> GetMyStudySetsAsync(int userId)
        {
            return await _context.StudySets 
                .Where(s => s.UserId == userId)
                .Select(s => new StudySetDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    UserId = s.UserId,
                    FlashCardIds = s.FlashCards.Select(f => f.Id).ToList(), 
                    CreatedAt = s.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<StudySetDto?> GetStudySetByIdAsync(int id)
        {
            return await _context.StudySets 
                .Where(s => s.Id == id)
                .Select(s => new StudySetDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    UserId = s.UserId,
                    FlashCardIds = s.FlashCards.Select(f => f.Id).ToList(), 
                    CreatedAt = s.CreatedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task AddAsync(StudySet studySet)
        {
            _context.StudySets.Add(studySet); 
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var studySet = await _context.StudySets.FindAsync(id); 
            if (studySet != null)
            {
                _context.StudySets.Remove(studySet); 
                await _context.SaveChangesAsync();
            }
        }

       public async Task<PagedResult<StudySetDto>> GetAllStudySetsAsync(string? kw, int limit, int page, string? sort, int? userId)
        {
            var studySets = await GetFilteredStudySetsAsync(kw, limit, page, sort, userId);
            var totalCount = await CountStudySetsAsync(kw, userId);

            var studySetDtos = studySets.Select(s => new StudySetDto
            {
                Id = s.Id,
                Name = s.Name,
                UserId = s.UserId,
                CreatedAt = s.CreatedAt,
                FlashCardIds = s.FlashCards.Select(f => f.Id).ToList()
            });

            return new PagedResult<StudySetDto>(studySetDtos, totalCount, page, limit);
        }

        public async Task<IEnumerable<StudySet>> GetFilteredStudySetsAsync(string? keyword, int limit, int page, string? sort, int? userId)
        {
            var query = _context.StudySets.AsQueryable();

            if (!string.IsNullOrEmpty(keyword))
            {
                query = query.Where(s => s.Name.Contains(keyword));
            }

            if (userId.HasValue)
            {
                query = query.Where(s => s.UserId == userId.Value);
            }

            if (!string.IsNullOrEmpty(sort))
            {
                query = sort switch
                {
                    "name_asc" => query.OrderBy(s => s.Name),
                    "name_desc" => query.OrderByDescending(s => s.Name),
                    _ => query.OrderBy(s => s.CreatedAt)
                };
            }

            return await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();
        }


        public async Task<int> CountStudySetsAsync(string? keyword, int? userId)
        {
            var query = _context.StudySets.AsQueryable();

            if (!string.IsNullOrEmpty(keyword))
            {
                query = query.Where(s => s.Name.Contains(keyword));
            }

            if (userId.HasValue)
            {
                query = query.Where(s => s.UserId == userId.Value);
            }

            return await query.CountAsync();
        }


    }
}
