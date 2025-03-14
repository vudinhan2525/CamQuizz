
namespace CamQuizzBE.Domain.Interfaces;

using CamQuizzBE.Application.DTOs;
using CamQuizzBE.Domain.Entities;

public interface IAnswerService
{
    Task<PagedResult<Answers>> GetAllAnswersAsync(int limit, int page, string? sort, int? questionId);
    Task<Answers?> GetAnswerByIdAsync(int id);
    Task CreateAnswerAsync(Answers answer);
    Task<Answers> UpdateAnswerAsync(UpdateAnswerDto updateAnswerDto);
    Task DeleteAnswerAsync(int id);
}
