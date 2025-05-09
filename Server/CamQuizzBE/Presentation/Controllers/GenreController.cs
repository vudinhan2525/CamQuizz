using CamQuizzBE.Domain.Enums;
using CamQuizzBE.Presentation.Utils;
using Microsoft.AspNetCore.Mvc;

namespace CamQuizzBE.Presentation.Controllers;

[Route("api/v1/genres")]
[ApiController]
public class GenreController : ControllerBase
{
    private readonly ILogger<GenreController> _logger;

    public GenreController(ILogger<GenreController> logger)
    {
        _logger = logger;
    }

    // GET: api/v1/genres
    [HttpGet]
    public ActionResult<ApiResponse<IEnumerable<object>>> GetAllGenres()
    {
        var genres = new List<object>
        {
            new { Id = (int)GenreType.GeneralKnowledge, Name = "General Knowledge" },
            new { Id = (int)GenreType.Mathematics, Name = "Mathematics" },
            new { Id = (int)GenreType.Science, Name = "Science" },
            new { Id = (int)GenreType.History, Name = "History" },
            new { Id = (int)GenreType.Languages, Name = "Languages" },
            new { Id = (int)GenreType.Technology, Name = "Technology" },
            new { Id = (int)GenreType.ArtsAndLiterature, Name = "Arts & Literature" },
            new { Id = (int)GenreType.Geography, Name = "Geography" }
        };

        var response = new ApiResponse<IEnumerable<object>>(genres, "success");
        return Ok(response);
    }

    // GET: api/v1/genres/{id}
    [HttpGet("{id}")]
    public ActionResult<ApiResponse<object>> GetGenreById(int id)
    {
        if (!Enum.IsDefined(typeof(GenreType), id))
        {
            return NotFound(new ApiResponse<object>(null, "Genre not found", null));
        }

        var genreName = Enum.GetName(typeof(GenreType), id);
        var genre = new { Id = id, Name = genreName };

        var response = new ApiResponse<object>(genre, "success");
        return Ok(response);
    }
}