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
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IQuizzesService, QuizzesService>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IQuizzesRepository, QuizzesRepository>();
        services.AddScoped<GroupService>();

        services.AddScoped<IGroupRepository, GroupRepository>();
        services.AddScoped<IMemberRepository, MemberRepository>();
        services.AddScoped<IMemberService, MemberService>();
        services.AddScoped<IStudySetRepository, StudySetRepository>();
        services.AddScoped<IStudySetService, StudySetService>();


        // Register Auto Mapper
        services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
        return services;
    }
}
