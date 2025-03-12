namespace CamQuizzBE.Presentation.Controllers;

using CamQuizzBE.Applications.DTOs.StudySets;
using CamQuizzBE.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using System.Threading.Tasks;

[Route("api/v1/study-sets")]
[ApiController]
public class StudySetController : ControllerBase
{
    private readonly IStudySetService _studySetService;

    public StudySetController(IStudySetService studySetService) // Inject Interface
    {
        _studySetService = studySetService;
    }


    [HttpGet("my-study-sets/{userId}")]
    [Authorize]
    public async Task<IActionResult> GetMyStudySets(int userId, [FromQuery] string? kw, [FromQuery] int limit = 10, [FromQuery] int page = 1)
    {
        var studySets = await _studySetService.GetMyStudySetsAsync(userId, kw, limit, page);
        return Ok(studySets);
    }


    [HttpGet("{id}")]
    public async Task<IActionResult> GetStudySetById(int id)
    {
        var studySet = await _studySetService.GetStudySetByIdAsync(id);
        if (studySet == null)
            return NotFound();
        return Ok(studySet);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllStudySets([FromQuery] string? kw, [FromQuery] int limit = 10, [FromQuery] int page = 1, [FromQuery] string? sort = null, [FromQuery] int? userId = null)
    {
        var studySets = await _studySetService.GetAllStudySetsAsync(kw, limit, page, sort, userId);
        return Ok(studySets);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateStudySet([FromBody] CreateStudySetDto studySetDto)
    {
        if (studySetDto == null)
        {
            return BadRequest("Invalid study set data.");
        }

        var createdStudySet = await _studySetService.CreateStudySetAsync(studySetDto);
        return CreatedAtAction(nameof(GetStudySetById), new { id = createdStudySet.Id }, createdStudySet);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteStudySet(int id)
    {
        await _studySetService.DeleteStudySetAsync(id);
        return NoContent();
    }
}
