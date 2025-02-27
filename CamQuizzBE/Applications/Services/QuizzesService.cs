// Infrastructure/Services/QuizzesService.cs
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Domain.Repositories;

namespace CamQuizzBE.Applications.Services;

public class QuizzesService : IQuizzesService
{
    private readonly IConfiguration _config;
    private readonly IQuizzesRepository _quizzesRepo;

    public QuizzesService(IConfiguration config, IQuizzesRepository quizzesRepo)
    {
        _config = config;
        _quizzesRepo = quizzesRepo;
    }

    public async Task<IEnumerable<Quizzes>> GetAllQuizzesAsync()
    {
        // Example of using _config
        var pageSize = _config.GetValue<int>("Pagination:PageSize");

        // Implement logic here, e.g., getting all quizzes from a repository
        return new List<Quizzes>();  // Dummy return for example
    }

    public async Task<Quizzes?> GetQuizByIdAsync(int id)
    {
        // Implement logic to get quiz by ID
        return new Quizzes();  // Dummy return for example
    }

    public async Task CreateQuizAsync(Quizzes quiz)
    {
        // // Example of using _userRepo
        // var user = await _userRepo.GetUserByIdAsync(quiz.CreatedByUserId);
        // if (user == null)
        // {
        //     throw new Exception("User not found");
        // }

        await _quizzesRepo.AddAsync(quiz);

    }

    public async Task DeleteQuizAsync(int id)
    {
        // Implement logic to delete a quiz
    }
}
