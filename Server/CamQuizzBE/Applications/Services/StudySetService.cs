namespace CamQuizzBE.Applications.Services;
using CamQuizzBE.Infras.Repositories;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Applications.DTOs.StudySets;
using CamQuizzBE.Applications.DTOs.FlashCards;
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
        var studySet = await _studySetRepository.GetStudySetByIdAsync(id);

        if (studySet == null)
            return null;

        return new StudySetDto
        {
            Id = studySet.Id,
            Name = studySet.Name,
            UserId = studySet.UserId,
            CreatedAt = studySet.CreatedAt,
            FlashCards = studySet.FlashCards.Select(f => new FlashCardDto
            {
                Id = f.Id,
                Question = f.Question,
                Answer = f.Answer
            }).ToList()
        };
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
    public async Task<StudySet> UpdateStudySetAsync(UpdateStudySetDto updateStudySetDto)
    {
        var studySet = await _studySetRepository.GetStudySetByIdAsync(updateStudySetDto.Id);

        if (studySet == null)
            throw new KeyNotFoundException("Study set not found");

        studySet.Name = updateStudySetDto.Name;

        if (updateStudySetDto.GetType().GetProperty("UserId") != null)
        {
            studySet.UserId = updateStudySetDto.UserId ?? studySet.UserId;
        }

        await _studySetRepository.UpdateAsync(studySet);

        return studySet;
    }


}
