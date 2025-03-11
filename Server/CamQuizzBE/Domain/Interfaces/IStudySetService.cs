namespace CamQuizzBE.Domain.Interfaces;

using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Applications.DTOs.StudySets;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface IStudySetService
{
    Task<IEnumerable<StudySetDto>> GetMyStudySetsAsync(int userId);
    Task<PagedResult<StudySetDto>> GetAllStudySetsAsync(string? kw, int limit, int page, string? sort, int? userId);
    Task<StudySetDto?> GetStudySetByIdAsync(int id);
    Task<StudySet> CreateStudySetAsync(CreateStudySetDto studySetDto);
    Task DeleteStudySetAsync(int id);
}
