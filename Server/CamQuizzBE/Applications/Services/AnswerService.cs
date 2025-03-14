// Infrastructure/Services/QuizzesService.cs
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Domain.Repositories;

namespace CamQuizzBE.Applications.Services;

public class AnswerService : IAnswerService
{
    private readonly IConfiguration _config;
    private readonly IAnswerRepository _answerRepo;

    public AnswerService(IConfiguration config, IAnswerRepository answerRepo)
    {
        _config = config;
        _answerRepo = answerRepo;
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
        await _answerRepo.AddAsync(answer);
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


}
