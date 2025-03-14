using CamQuizzBE.Infras.Data;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Infras.Repositories;
using CamQuizzBE.Applications.Services;
using CamQuizzBE.Domain.Repositories;

using Microsoft.EntityFrameworkCore;
namespace CamQuizzBE.Presentation.Middleware;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config)
    {
        // CORS
        services.AddCors();


        // Register DB
        services.AddDbContext<DataContext>(opt =>
        {
            opt.UseMySql(config.GetConnectionString("DefaultConnection"),
         ServerVersion.AutoDetect(config.GetConnectionString("DefaultConnection")));
        });




        // Register Controller
        services.AddControllers();


        // Register DI
        // Service
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IQuizzesService, QuizzesService>();
        services.AddScoped<IMemberService, MemberService>();
        services.AddScoped<IStudySetService, StudySetService>();
        services.AddScoped<IFlashCardService, FlashCardService>();
        services.AddScoped<IQuestionsService, QuestionsService>();
        services.AddScoped<IAnswerService, AnswerService>();
        services.AddScoped<GroupService>();

        // Repos
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IQuizzesRepository, QuizzesRepository>();
        services.AddScoped<IGroupRepository, GroupRepository>();
        services.AddScoped<IMemberRepository, MemberRepository>();
        services.AddScoped<IStudySetRepository, StudySetRepository>();
        services.AddScoped<IFlashCardRepository, FlashCardRepository>();
        services.AddScoped<IQuestionRepository, QuestionsRepository>();
        services.AddScoped<IAnswerRepository, AnswerRepository>();






        // Register Auto Mapper
        services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
        return services;
    }
}
