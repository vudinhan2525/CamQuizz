using AutoMapper;
using CamQuizzBE.Application.DTOs;
using CamQuizzBE.Applications.DTOs.Answers;
using CamQuizzBE.Applications.DTOs.Questions;
using CamQuizzBE.Applications.DTOs.Quizzes;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;

public class QuizMappingProfile : Profile
{
    public QuizMappingProfile()
    {
        // Create quiz mappings
        CreateMap<CreateQuizDto, CreateQuizBody>();
        CreateMap<CreateQuestionDto, CreateQuestionBody>();
        CreateMap<CreateAnswerDto, CreateAnswerBody>();

        // Read quiz mappings
        CreateMap<Quizzes, QuizzesDto>();
        CreateMap<Questions, QuestionsDto>();
        CreateMap<Answers, AnswerDto>();
    }
}