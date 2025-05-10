namespace CamQuizzBE.Applications.Services;

using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Infras.Repositories;
using CamQuizzBE.Applications.DTOs.FlashCards;
using System.Collections.Generic;
using System.Threading.Tasks;

public class FlashCardService : IFlashCardService
{
    private readonly IFlashCardRepository _flashCardRepository;

    public FlashCardService(IFlashCardRepository flashCardRepository)
    {
        _flashCardRepository = flashCardRepository;
    }

    public async Task<IEnumerable<FlashCardDto>> GetByStudySetIdAsync(int studySetId)
    {
        return await _flashCardRepository.GetFlashCardsByStudySetIdAsync(studySetId);
    }

    public async Task<FlashCardDto?> GetByIdAsync(int id)
    {
        return await _flashCardRepository.GetFlashCardByIdAsync(id);
    }

    public async Task<FlashCard> CreateAsync(CreateFlashCardDto flashCardDto)
    {
        var flashCard = new FlashCard
        {
            StudySetId = flashCardDto.StudySetId,
            Question = flashCardDto.Question,
            Answer = flashCardDto.Answer
        };

        await _flashCardRepository.AddAsync(flashCard);
        return flashCard;
    }

    public async Task DeleteAsync(int id)
    {
        await _flashCardRepository.DeleteAsync(id);
    }
    public async Task<FlashCard> UpdateFlashCardAsync(UpdateFlashCardDto updateFlashCard)
    {
        var existingFlashCard = await _flashCardRepository.GetFlashCardByIdAsync(updateFlashCard.Id);
        if (existingFlashCard == null)
        {
            throw new KeyNotFoundException("FlashCard not found.");
        }

        // Convert FlashCardDto to FlashCard entity
        var flashCardEntity = new FlashCard
        {
            Id = existingFlashCard.Id,
            StudySetId = existingFlashCard.StudySetId,
            Question = updateFlashCard.Question,
            Answer = updateFlashCard.Answer,
            CreatedAt = existingFlashCard.CreatedAt
        };

        await _flashCardRepository.UpdateAsync(flashCardEntity);
        return flashCardEntity;
    }

}