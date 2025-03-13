
using CamQuizzBE.Applications.DTOs.Quizzes;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Enums;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Presentation.Exceptions;
using CamQuizzBE.Presentation.Utils;

namespace CamQuizzBE.Presentation.Controllers;

[Route("api/v1/question")]
[ApiController]
public class QuestionController(ILogger<QuestionController> _logger, IQuestionsService _questionsService, IMapper mapper) : ControllerBase
{
    private readonly ILogger<QuestionController> _logger = _logger;

    private readonly IQuestionsService _questionsService = _questionsService;
    private readonly IMapper _mapper = mapper;

    // GET: api/v1/question
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<QuestionsDto>>>> GetAllQuizzes(
        [FromQuery] string? kw,
        [FromQuery] int limit = 10,
        [FromQuery] int page = 1,
        [FromQuery] int quizId = 0,
        [FromQuery] string? sort = "created_at")
    {
        var data = await _questionsService.GetAllQuestionsAsync(kw, limit, page, sort, quizId);

        var questionsDtos = _mapper.Map<IEnumerable<QuestionsDto>>(data.Items);
        var pagination = new PaginationMeta
        {
            TotalItems = data.TotalItems,
            TotalPages = data.TotalPages,
            Page = page,
            Limit = limit
        };

        var response = new ApiResponse<IEnumerable<QuestionsDto>>(questionsDtos, "success", pagination);
        return Ok(response);
    }


    // GET: api/v1/question/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<QuestionsDto>> GetQuestionById(int id)
    {
        if (id <= 0)
        {
            throw new ValidatorException("Invalid question ID. Must be greater than 0.");
        }

        var question = await _questionsService.GetQuestionByIdAsync(id);
        if (question == null)
        {
            throw new KeyNotFoundException("Question not found.");
        }

        var quesDto = _mapper.Map<QuestionsDto>(question);

        var response = new ApiResponse<QuestionsDto>(quesDto);

        return Ok(response);
    }

    // POST: api/v1/question
    [HttpPost]
    public async Task<ActionResult> CreateQuestion([FromBody] CreateQuestionDto createQuestionDto)
    {

        var questionEntity = new Questions
        {
            Name = createQuestionDto.Name,
            Description = createQuestionDto.Description,
            QuizId = createQuestionDto.QuizId,
            Score = createQuestionDto.Score ?? 0,

        };

        await _questionsService.CreateQuestionAsync(questionEntity);

        // Map back to DTO for response
        var createdQuestionDto = _mapper.Map<QuestionsDto>(questionEntity);

        var response = new ApiResponse<QuestionsDto>(createdQuestionDto);

        return CreatedAtAction(nameof(GetQuestionById), new { id = createdQuestionDto.Id }, response);
    }

    // DELETE: api/v1/question/{id}
    [HttpDelete("{id}")]
    public async Task<ActionResult> DelteQuestion(int id)
    {
        if (id <= 0)
        {
            throw new ValidatorException("Invalid question ID. Must be greater than 0.");
        }

        await _questionsService.DeleteQuestionAsync(id);
        return NoContent();
    }
}
