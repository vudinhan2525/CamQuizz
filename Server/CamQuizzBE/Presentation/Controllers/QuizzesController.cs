
using CamQuizzBE.Applications.DTOs.Quizzes;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Enums;
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


    // GET: api/v1/quiz/my-quizzes
    [HttpGet("my-quizzes")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<IEnumerable<QuizzesDto>>>> GetMyQuizzes(
        [FromQuery] string? kw,
        [FromQuery] int limit = 10,
        [FromQuery] int page = 1,
        [FromQuery] string? sort = "created_at")
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var data = await _quizzesService.GetQuizzesByUserAsync(userId, kw, limit, page, sort);

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

    // GET: api/v1/quiz/user/{userId}
    [HttpGet("user/{userId}")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<IEnumerable<QuizzesDto>>>> GetQuizzesByUser(
        int userId,
        [FromQuery] string? kw,
        [FromQuery] int limit = 10,
        [FromQuery] int page = 1,
        [FromQuery] string? sort = "created_at")
    {
        var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        
        // Check if user is trying to access their own quizzes or is admin
        if (currentUserId != userId && !User.IsInRole("Admin"))
        {
            return Unauthorized("You can only access your own quizzes");
        }

        var data = await _quizzesService.GetQuizzesByUserAsync(userId, kw, limit, page, sort);

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
        _logger.LogInformation("✅ Questions count: {Count}", createQuizDto.Questions.Count);
        _logger.LogInformation("Raw DTO: {@CreateQuizDto}", createQuizDto);
        var quizEntity = new CreateQuizBody
        {
            Name = createQuizDto.Name,
            Image = !string.IsNullOrWhiteSpace(createQuizDto.Image) ? createQuizDto.Image : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTadtxXyVjVDyg7TfbT8FJIdGSXdrT3ex9yqQ&s",
            GenreId = createQuizDto.GenreId ?? 0,
            UserId = createQuizDto.UserId ?? 0,
            Status = createQuizDto.Status,
            UserShareIds = createQuizDto.UserShareIds,
            GroupShareIds = createQuizDto.GroupShareIds,
            Questions = createQuizDto.Questions
        };

        var newQuiz = await _quizzesService.CreateQuizAsync(quizEntity);

        var createdQuizDto = _mapper.Map<QuizzesDto>(newQuiz);

        var response = new ApiResponse<QuizzesDto>(createdQuizDto);

        return CreatedAtAction(nameof(GetQuizById), new { id = createdQuizDto.Id }, response);
    }

    // PUT: api/v1/quiz
    [HttpPut]
    public async Task<ActionResult> UpdateQuiz([FromBody] UpdateQuizDto updateQuizDto)
    {

        var quiz = await _quizzesService.UpdateQuizAsync(updateQuizDto);

        // Map back to DTO for response
        var updatedQuiz = _mapper.Map<QuizzesDto>(quiz);

        var response = new ApiResponse<QuizzesDto>(updatedQuiz);

        return Ok(response);
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
