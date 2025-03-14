namespace CamQuizzBE.Domain.Interfaces;

using CamQuizzBE.Applications.DTOs.StudySets;
using CamQuizzBE.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface IStudySetRepository
{
    Task<PagedResult<StudySetDto>> GetMyStudySetsAsync(int userId, string? keyword, int limit, int page);
    Task<StudySetDto?> GetStudySetByIdAsync(int id);
    Task AddAsync(StudySet studySet);
    Task DeleteAsync(int id);
    Task<PagedResult<StudySetDto>> GetAllStudySetsAsync(string? kw, int limit, int page, string? sort, int? userId);

    Task<IEnumerable<StudySet>> GetFilteredStudySetsAsync(string? keyword, int limit, int page, string? sort, int? userId);

    Task<int> CountStudySetsAsync(string? keyword, int? userId);

}
