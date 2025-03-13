namespace CamQuizzBE.Applications.Services;
using CamQuizzBE.Infras.Repositories;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Applications.DTOs.StudySets;
using System.Collections.Generic;
using System.Threading.Tasks;

public class StudySetService : IStudySetService
{
    private readonly IStudySetRepository _studySetRepository;

    public StudySetService(IStudySetRepository studySetRepository)
    {
        _studySetRepository = studySetRepository;
    }
    public async Task<PagedResult<StudySetDto>> GetMyStudySetsAsync(int userId, string? keyword, int limit, int page)
    {
        return await _studySetRepository.GetMyStudySetsAsync(userId, keyword, limit, page);
    }


    public async Task<PagedResult<StudySetDto>> GetAllStudySetsAsync(string? kw, int limit, int page, string? sort, int? userId)
    {
        return await _studySetRepository.GetAllStudySetsAsync(kw, limit, page, sort, userId);
    }


    public async Task<StudySetDto?> GetStudySetByIdAsync(int id)
    {
        return await _studySetRepository.GetStudySetByIdAsync(id);
    }

    public async Task<StudySet> CreateStudySetAsync(CreateStudySetDto studySetDto)
    {
        var studySet = new StudySet
        {
            Name = studySetDto.Name,
            UserId = studySetDto.UserId
        };

        await _studySetRepository.AddAsync(studySet);
        return studySet;
    }

    public async Task DeleteStudySetAsync(int id)
    {
        await _studySetRepository.DeleteAsync(id);
    }
}
