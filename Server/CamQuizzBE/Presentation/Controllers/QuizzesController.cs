
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
        bool isAdmin = User.IsInRole("Admin");
        bool showPrivate = isAdmin;

        // Pass the showPrivate flag to the service to filter quizzes
        var data = await _quizzesService.GetAllQuizzesAsync(kw, limit, page, sort, genre_id, showPrivate);

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

    // GET: api/v1/quiz/top5
    [HttpGet("top5")]
    public async Task<ActionResult<ApiResponse<IEnumerable<QuizzesDto>>>> GetTop5Quizzes()
    {
        var data = await _quizzesService.GetTop5Quizzes();

        var quizzesDto = _mapper.Map<IEnumerable<QuizzesDto>>(data);

        var response = new ApiResponse<IEnumerable<QuizzesDto>>(quizzesDto, "success");
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

    // GET: api/v1/quiz/shared-with-me
    [HttpGet("shared-with-me")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<IEnumerable<QuizzesDto>>>> GetSharedQuizzes(
        [FromQuery] string? kw,
        [FromQuery] int limit = 10,
        [FromQuery] int page = 1,
        [FromQuery] string? sort = "created_at")
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        if (userId == 0)
        {
            return Unauthorized(new ApiResponse<IEnumerable<QuizzesDto>>(null, "User not authenticated"));
        }

        var data = await _quizzesService.GetSharedQuizzesAsync(userId, kw, limit, page, sort);
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
        _logger.LogInformation("Received CreateQuizDto: {Dto}", JsonSerializer.Serialize(createQuizDto));

        var quizEntity = _mapper.Map<CreateQuizBody>(createQuizDto);

        _logger.LogInformation("Mapped to CreateQuizBody: UserEmails={UserEmails}, GroupShareIds={GroupShareIds}",
            string.Join(",", quizEntity.UserEmails), string.Join(",", quizEntity.GroupShareIds));

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

    // POST: api/v1/quiz/share/email
    [HttpPost("share/email")]
    [Authorize]
    public async Task<ActionResult> ShareByEmail([FromBody] ShareQuizByEmailDto request)
    {
        try
        {
            // Set the owner ID from the current user's claims
            request.OwnerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var result = await _quizzesService.ShareQuizByEmailAsync(request);
            if (!result.Success)
            {
                return BadRequest(new ApiResponse<object>(null, result.Message));
            }

            return Ok(new ApiResponse<object>(null, result.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sharing quiz by email");
            return BadRequest(new ApiResponse<object>(null, ex.Message));
        }
    }
}
