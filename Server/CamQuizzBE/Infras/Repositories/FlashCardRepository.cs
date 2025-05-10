using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Applications.DTOs.FlashCards;
using CamQuizzBE.Infras.Data;
using Microsoft.EntityFrameworkCore;

namespace CamQuizzBE.Infras.Repositories
{
    public class FlashCardRepository : IFlashCardRepository
    {
        private readonly DataContext _context;

        public FlashCardRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<FlashCardDto>> GetFlashCardsByStudySetIdAsync(int studySetId)
        {
            return await _context.FlashCards // ✅ Fix here
                .Where(f => f.StudySetId == studySetId)
                .Select(f => new FlashCardDto
                {
                    Id = f.Id,
                    StudySetId = f.StudySetId,
                    Question = f.Question,
                    Answer = f.Answer,
                    CreatedAt = f.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<FlashCardDto?> GetFlashCardByIdAsync(int id)
        {
            return await _context.FlashCards // ✅ Fix here
                .Where(f => f.Id == id)
                .Select(f => new FlashCardDto
                {
                    Id = f.Id,
                    StudySetId = f.StudySetId,
                    Question = f.Question,
                    Answer = f.Answer,
                    CreatedAt = f.CreatedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task AddAsync(FlashCard flashCard)
        {
            _context.FlashCards.Add(flashCard); // ✅ Fix here
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var flashCard = await _context.FlashCards.FindAsync(id); // ✅ Fix here
            if (flashCard != null)
            {
                _context.FlashCards.Remove(flashCard); // ✅ Fix here
                await _context.SaveChangesAsync();
            }
        }
        public async Task UpdateAsync(FlashCard flashCard)
                {
                    var existingFlashCard = await _context.FlashCards.FindAsync(flashCard.Id);
                    if (existingFlashCard == null)
                    {
                        throw new KeyNotFoundException("FlashCard not found.");
                    }

                    existingFlashCard.Question = flashCard.Question;
                    existingFlashCard.Answer = flashCard.Answer;

                    _context.FlashCards.Update(existingFlashCard);
                    await _context.SaveChangesAsync();
                }
    }
}