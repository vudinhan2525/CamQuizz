using CamQuizzBE.Applications.DTOs.FlashCards;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CamQuizzBE.Presentation.Controllers
{
    [Route("api/v1/flashcards")]
    [ApiController]
    public class FlashCardController : ControllerBase
    {
        private readonly IFlashCardService _flashCardService;

        public FlashCardController(IFlashCardService flashCardService)
        {
            _flashCardService = flashCardService;
        }

        [HttpGet("study-set/{studySetId}")]
        public async Task<IActionResult> GetFlashCardsByStudySetId(int studySetId)
        {
            var flashCards = await _flashCardService.GetByStudySetIdAsync(studySetId);
            return Ok(flashCards);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetFlashCardById(int id)
        {
            var flashCard = await _flashCardService.GetByIdAsync(id);
            if (flashCard == null)
                return NotFound();
            return Ok(flashCard);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateFlashCard([FromBody] CreateFlashCardDto flashCardDto)
        {
            if (flashCardDto == null)
            {
                return BadRequest("Invalid flashcard data.");
            }

            var createdFlashCard = await _flashCardService.CreateAsync(flashCardDto);
            return CreatedAtAction(nameof(GetFlashCardById), new { id = createdFlashCard.Id }, createdFlashCard);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteFlashCard(int id)
        {
            await _flashCardService.DeleteAsync(id);
            return NoContent();
        }
    }
}