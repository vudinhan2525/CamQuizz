
using CamQuizzBE.Application.DTOs;
using CamQuizzBE.Applications.DTOs.Answers;
using CamQuizzBE.Applications.DTOs.Quizzes;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Enums;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Presentation.Exceptions;
using CamQuizzBE.Presentation.Utils;

namespace CamQuizzBE.Presentation.Controllers;

[Route("api/v1/answer")]
[ApiController]
public class AnswerController(ILogger<AnswerController> _logger, IAnswerService _answerService, IMapper mapper) : ControllerBase
{
    private readonly ILogger<AnswerController> _logger = _logger;

    private readonly IAnswerService _answerService = _answerService;
    private readonly IMapper _mapper = mapper;

    // GET: api/v1/answer
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<AnswerDto>>>> GetAllAnswers(
        [FromQuery] int limit = 10,
        [FromQuery] int page = 1,
        [FromQuery] int questionId = 0,
        [FromQuery] string? sort = "created_at")
    {
        var data = await _answerService.GetAllAnswersAsync(limit, page, sort, questionId);

        var answerDtos = _mapper.Map<IEnumerable<AnswerDto>>(data.Items);
        var pagination = new PaginationMeta
        {
            TotalItems = data.TotalItems,
            TotalPages = data.TotalPages,
            Page = page,
            Limit = limit
        };

        var response = new ApiResponse<IEnumerable<AnswerDto>>(answerDtos, "success", pagination);
        return Ok(response);
    }


    // GET: api/v1/answer/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<AnswerDto>> GetAnswerById(int id)
    {
        if (id <= 0)
        {
            throw new ValidatorException("Invalid answer ID. Must be greater than 0.");
        }

        var answer = await _answerService.GetAnswerByIdAsync(id);
        if (answer == null)
        {
            throw new KeyNotFoundException("Answer not found.");
        }

        var answerDto = _mapper.Map<AnswerDto>(answer);

        var response = new ApiResponse<AnswerDto>(answerDto);

        return Ok(response);
    }

    // POST: api/v1/answer
    [HttpPost]
    public async Task<ActionResult> CreateAnswer([FromBody] CreateAnswerDto createAnswerDto)
    {

        var answerEntity = new Answers
        {
            Answer = createAnswerDto.Answer,
            IsCorrect = createAnswerDto.IsCorrect,
            QuestionId = createAnswerDto.QuestionId,

        };

        await _answerService.CreateAnswerAsync(answerEntity);

        // Map back to DTO for response
        var createdAns = _mapper.Map<AnswerDto>(answerEntity);

        var response = new ApiResponse<AnswerDto>(createdAns);

        return CreatedAtAction(nameof(GetAnswerById), new { id = createdAns.Id }, response);
    }

    // PUT: api/v1/answer
    [HttpPut]
    public async Task<ActionResult> UpdateAnswer([FromBody] UpdateAnswerDto updateAnswerDto)
    {


        var answer = await _answerService.UpdateAnswerAsync(updateAnswerDto);

        // Map back to DTO for response
        var createdAns = _mapper.Map<AnswerDto>(answer);

        var response = new ApiResponse<AnswerDto>(createdAns);

        return Ok(response);
    }

    // DELETE: api/v1/answer/{id}
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteAnswer(int id)
    {
        if (id <= 0)
        {
            throw new ValidatorException("Invalid answer ID. Must be greater than 0.");
        }

        await _answerService.DeleteAnswerAsync(id);
        return NoContent();
    }
}
