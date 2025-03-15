// Infrastructure/Services/QuizzesService.cs
using CamQuizzBE.Applications.DTOs.Quizzes;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Domain.Repositories;

namespace CamQuizzBE.Applications.Services;

public class QuestionsService : IQuestionsService
{
    private readonly IConfiguration _config;
    private readonly IQuestionRepository _questionsRepo;
    private readonly IQuizzesRepository _quizzesRepo;

    public QuestionsService(IConfiguration config, IQuestionRepository questionsRepo, IQuizzesRepository quizzesRepo)
    {
        _config = config;
        _questionsRepo = questionsRepo;
        _quizzesRepo = quizzesRepo;
    }

    public async Task<PagedResult<Questions>> GetAllQuestionsAsync(string? kw, int limit, int page, string? sort, int? quizId)
    {
        return await _questionsRepo.GetAllAsync(kw, limit, page, sort, quizId);
    }

    public async Task<Questions?> GetQuestionByIdAsync(int id)
    {
        return await _questionsRepo.GetByIdAsync(id);
    }

    public async Task CreateQuestionAsync(Questions question)
    {
        var createdQuestion = await _questionsRepo.AddAsync(question);
        if (createdQuestion != null)
        {
            await _quizzesRepo.IncrementQuestionCountAsync(createdQuestion.QuizId);
        }
    }

    public async Task DeleteQuestionAsync(int id)
    {
        var quiz = await _questionsRepo.GetByIdAsync(id);
        if (quiz == null)
        {
            throw new KeyNotFoundException("Questions not found.");
        }
        await _questionsRepo.DeleteAsync(id);
    }

    public async Task<Questions> UpdateQuestionAsync(UpdateQuestionDto updateQuestionDto)
    {
        var existingQues = await _questionsRepo.GetByIdAsync(updateQuestionDto.QuestionId);
        if (existingQues == null)
        {
            throw new KeyNotFoundException("Question not found.");
        }

        existingQues.Name = updateQuestionDto.Name ?? existingQues.Name;
        existingQues.Description = updateQuestionDto.Description ?? existingQues.Description;
        existingQues.Duration = updateQuestionDto.Duration ?? existingQues.Duration;
        existingQues.Score = updateQuestionDto.Score ?? existingQues.Score;

        existingQues.UpdatedAt = DateTime.UtcNow;

        await _questionsRepo.UpdateAsync(existingQues);
        return existingQues;
    }
}
