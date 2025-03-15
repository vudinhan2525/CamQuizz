// Infrastructure/Services/QuizzesService.cs
using CamQuizzBE.Application.DTOs;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Domain.Repositories;

namespace CamQuizzBE.Applications.Services;

public class AnswerService : IAnswerService
{
    private readonly IConfiguration _config;
    private readonly IAnswerRepository _answerRepo;
    private readonly IQuestionRepository _questionRepo;

    public AnswerService(IConfiguration config, IAnswerRepository answerRepo, IQuestionRepository questionRepo)
    {
        _config = config;
        _answerRepo = answerRepo;
        _questionRepo = questionRepo;
    }

    public async Task<PagedResult<Answers>> GetAllAnswersAsync(int limit, int page, string? sort, int? questionId)
    {
        return await _answerRepo.GetAllAsync(limit, page, sort, questionId);
    }

    public async Task<Answers?> GetAnswerByIdAsync(int id)
    {
        return await _answerRepo.GetByIdAsync(id);
    }

    public async Task CreateAnswerAsync(Answers answer)
    {
        var createdAns = await _answerRepo.AddAsync(answer);
        if (createdAns != null)
        {
            await _questionRepo.IncrementAnswerCountAsync(answer.QuestionId);
        }
    }

    public async Task DeleteAnswerAsync(int id)
    {

        var quiz = await _answerRepo.GetByIdAsync(id);
        if (quiz == null)
        {
            throw new KeyNotFoundException("Answer not found.");
        }
        await _answerRepo.DeleteAsync(id);
    }

    public async Task<Answers> UpdateAnswerAsync(UpdateAnswerDto updateAnswerDto)
    {
        var existingAns = await _answerRepo.GetByIdAsync(updateAnswerDto.AnswerID);
        if (existingAns == null)
        {
            throw new KeyNotFoundException("Answer not found.");
        }

        existingAns.Answer = updateAnswerDto.Answer ?? existingAns.Answer;
        existingAns.IsCorrect = updateAnswerDto.IsCorrect ?? existingAns.IsCorrect;
        existingAns.UpdatedAt = DateTime.UtcNow;


        await _answerRepo.UpdateAsync(existingAns);
        return existingAns;
    }
}
