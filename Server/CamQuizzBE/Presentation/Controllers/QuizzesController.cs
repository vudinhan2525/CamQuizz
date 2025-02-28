
using CamQuizzBE.Applications.DTOs.Quizzes;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;

namespace CamQuizzBE.Presentation.Controllers;

[Route("api/v1/quiz")]
[ApiController]
public class QuizzesController(IQuizzesService quizzesService, IMapper mapper) : ControllerBase
{
    private readonly IQuizzesService _quizzesService = quizzesService;
    private readonly IMapper _mapper = mapper;

    // GET: api/v1/quiz
    [HttpGet]
    public async Task<ActionResult<IEnumerable<QuizzesDto>>> GetAllQuizzes()
    {
        var quizzes = await _quizzesService.GetAllQuizzesAsync();
        var quizzesDto = _mapper.Map<IEnumerable<QuizzesDto>>(quizzes);
        return Ok(quizzesDto);
    }

    // GET: api/v1/quiz/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<QuizzesDto>> GetQuizById(int id)
    {
        var quiz = await _quizzesService.GetQuizByIdAsync(id);
        if (quiz == null)
        {
            return NotFound();
        }

        var quizDto = _mapper.Map<QuizzesDto>(quiz);
        return Ok(quizDto);
    }

    // POST: api/v1/quiz
    [HttpPost]
    public async Task<ActionResult> CreateQuiz([FromBody] QuizzesDto quizDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Map DTO to Entity
        var quizEntity = _mapper.Map<Quizzes>(quizDto);
        await _quizzesService.CreateQuizAsync(quizEntity);

        // Map back to DTO for response
        var createdQuizDto = _mapper.Map<QuizzesDto>(quizEntity);
        return CreatedAtAction(nameof(GetQuizById), new { id = createdQuizDto.Id }, createdQuizDto);
    }

    // DELETE: api/v1/quiz/{id}
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteQuiz(int id)
    {
        var quiz = await _quizzesService.GetQuizByIdAsync(id);
        if (quiz == null)
        {
            return NotFound();
        }

        await _quizzesService.DeleteQuizAsync(id);
        return NoContent();
    }
}
