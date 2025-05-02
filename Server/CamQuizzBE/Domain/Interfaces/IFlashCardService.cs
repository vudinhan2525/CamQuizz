namespace CamQuizzBE.Domain.Interfaces;

using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Applications.DTOs.FlashCards;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface IFlashCardService
{
    Task<IEnumerable<FlashCardDto>> GetByStudySetIdAsync(int studySetId);
    Task<FlashCardDto?> GetByIdAsync(int id);
    Task<FlashCard> CreateAsync(CreateFlashCardDto flashCardDto);
    Task DeleteAsync(int id);
    Task<FlashCard> UpdateFlashCardAsync(UpdateFlashCardDto updateFlashCard);
}