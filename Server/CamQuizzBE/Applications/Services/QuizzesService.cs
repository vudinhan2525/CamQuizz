// Infrastructure/Services/QuizzesService.cs
using CamQuizzBE.Applications.DTOs.Quizzes;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Domain.Repositories;

namespace CamQuizzBE.Applications.Services;

public class QuizzesService : IQuizzesService
{
    private readonly IConfiguration _config;
    private readonly IQuizzesRepository _quizzesRepo;
    private readonly IUserService _userService;

    public QuizzesService(IConfiguration config, IQuizzesRepository quizzesRepo, IUserService userService)
    {
        _config = config;
        _quizzesRepo = quizzesRepo;
        _userService = userService;
    }

    public async Task<PagedResult<Quizzes>> GetAllQuizzesAsync(string? kw, int limit, int page, string? sort, int? genreId)
    {
        return await _quizzesRepo.GetAllAsync(kw, limit, page, sort, genreId);
    }

    public async Task<List<Quizzes>> GetTop5Quizzes()
    {
        return await _quizzesRepo.GetTop5();
    }


    public async Task<PagedResult<Quizzes>> GetQuizzesByUserAsync(int userId, string? kw, int limit, int page, string? sort)
    {
        return await _quizzesRepo.GetByUserIdAsync(userId, kw, limit, page, sort);
    }

    public async Task<Quizzes?> GetQuizByIdAsync(int id)
    {
        return await _quizzesRepo.GetByIdAsync(id);
    }

    public async Task<Quizzes?> CreateQuizAsync(CreateQuizBody body)
    {
        var (isAllowed, message) = await _userService.CheckUserRule(body.UserId);

        if (!isAllowed)
        {
            throw new UnauthorizedAccessException(message);
        }

        return await _quizzesRepo.AddAsync(body);
    }

    public async Task DeleteQuizAsync(int id)
    {
        var quiz = await _quizzesRepo.GetByIdAsync(id);
        if (quiz == null)
        {
            throw new KeyNotFoundException("Quiz not found.");
        }
        await _quizzesRepo.DeleteAsync(id);
    }

    public async Task<Quizzes> UpdateQuizAsync(UpdateQuizDto updateQuiz)
    {
        var existingQuiz = await _quizzesRepo.GetByIdAsync(updateQuiz.Id);
        if (existingQuiz == null)
        {
            throw new KeyNotFoundException("Quiz not found.");
        }

        // Update properties
        existingQuiz.Name = updateQuiz.Name ?? existingQuiz.Name;
        existingQuiz.Image = updateQuiz.Image ?? existingQuiz.Image;
        existingQuiz.GenreId = updateQuiz.GenreId ?? existingQuiz.GenreId;
        existingQuiz.Status = updateQuiz.Status ?? existingQuiz.Status;
        existingQuiz.UpdatedAt = DateTime.UtcNow;

        await _quizzesRepo.UpdateAsync(existingQuiz);
        return existingQuiz;
    }
}
