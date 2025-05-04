namespace CamQuizzBE.Domain.Interfaces;

using CamQuizzBE.Applications.DTOs.FlashCards;
using CamQuizzBE.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface IFlashCardRepository
{
    Task<IEnumerable<FlashCardDto>> GetFlashCardsByStudySetIdAsync(int studySetId);
    Task<FlashCardDto?> GetFlashCardByIdAsync(int id);
    Task AddAsync(FlashCard flashCard);
    Task DeleteAsync(int id);
    Task UpdateAsync(FlashCard flashCard);
}