
using CamQuizzBE.Applications.DTOs.Quizzes;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Presentation.Exceptions;
using CamQuizzBE.Presentation.Utils;

namespace CamQuizzBE.Presentation.Controllers;

[Route("api/v1/quiz")]
[ApiController]
public class QuizzesController(ILogger<QuizzesController> _logger, IQuizzesService quizzesService, IMapper mapper) : ControllerBase
{
    private readonly ILogger<QuizzesController> _logger = _logger;

    private readonly IQuizzesService _quizzesService = quizzesService;
    private readonly IMapper _mapper = mapper;

    // GET: api/v1/quiz
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<QuizzesDto>>>> GetAllQuizzes(
        [FromQuery] string? kw,
        [FromQuery] int limit = 10,
        [FromQuery] int page = 1,
        [FromQuery] int genre_id = 0,
        [FromQuery] string? sort = "created_at")
    {
        var data = await _quizzesService.GetAllQuizzesAsync(kw, limit, page, sort, genre_id);

        var quizzesDto = _mapper.Map<IEnumerable<QuizzesDto>>(data.Items);
        var pagination = new PaginationMeta
        {
            TotalItems = data.TotalItems,
            TotalPages = data.TotalPages,
            Page = page,
            Limit = limit
        };

        var response = new ApiResponse<IEnumerable<QuizzesDto>>(quizzesDto, "success", pagination);
        return Ok(response);
    }


    // GET: api/v1/quiz/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<QuizzesDto>> GetQuizById(int id)
    {
        if (id <= 0)
        {
            throw new ValidatorException("Invalid quiz ID. Must be greater than 0.");
        }

        var quiz = await _quizzesService.GetQuizByIdAsync(id);
        if (quiz == null)
        {
            throw new KeyNotFoundException("Quiz not found.");
        }

        var quizDto = _mapper.Map<QuizzesDto>(quiz);

        var response = new ApiResponse<QuizzesDto>(quizDto);

        return Ok(response);
    }

    // POST: api/v1/quiz
    [HttpPost]
    public async Task<ActionResult> CreateQuiz([FromBody] CreateQuizDto createQuizDto)
    {

        var quizEntity = new Quizzes
        {
            Name = createQuizDto.Name,
            Image = !string.IsNullOrWhiteSpace(createQuizDto.Image) ? createQuizDto.Image : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTadtxXyVjVDyg7TfbT8FJIdGSXdrT3ex9yqQ&s",
            GenreId = createQuizDto.GenreId ?? 0,
            UserId = createQuizDto.UserId ?? 0
        };

        await _quizzesService.CreateQuizAsync(quizEntity);

        // Map back to DTO for response
        var createdQuizDto = _mapper.Map<QuizzesDto>(quizEntity);

        var response = new ApiResponse<QuizzesDto>(createdQuizDto);

        return CreatedAtAction(nameof(GetQuizById), new { id = createdQuizDto.Id }, response);
    }

    // DELETE: api/v1/quiz/{id}
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteQuiz(int id)
    {
        if (id <= 0)
        {
            throw new ValidatorException("Invalid quiz ID. Must be greater than 0.");
        }

        await _quizzesService.DeleteQuizAsync(id);
        return NoContent();
    }
}
