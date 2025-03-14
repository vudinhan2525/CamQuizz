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

    public QuizzesService(IConfiguration config, IQuizzesRepository quizzesRepo)
    {
        _config = config;
        _quizzesRepo = quizzesRepo;
    }

    public async Task<PagedResult<Quizzes>> GetAllQuizzesAsync(string? kw, int limit, int page, string? sort, int? genreId)
    {
        return await _quizzesRepo.GetAllAsync(kw, limit, page, sort, genreId);
    }

    public async Task<Quizzes?> GetQuizByIdAsync(int id)
    {
        return await _quizzesRepo.GetByIdAsync(id);
    }

    public async Task CreateQuizAsync(Quizzes quiz)
    {
        await _quizzesRepo.AddAsync(quiz);
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
