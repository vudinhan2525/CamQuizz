using CamQuizzBE.Infras.Data;
using CamQuizzBE.Applications.Helpers;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Infras.Repositories;
using CamQuizzBE.Applications.Services;
using CamQuizzBE.Domain.Repositories;

namespace CamQuizzBE.Presentation.Middleware;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config)
    {
        services.AddControllers();
        services.AddDbContext<DataContext>(opt =>
        {
            opt.UseNpgsql(config.GetConnectionString("DefaultConnection"));
        });
        services.AddCors();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IQuizzesService, QuizzesService>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IQuizzesRepository, QuizzesRepository>();
        services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
        return services;
    }
}
