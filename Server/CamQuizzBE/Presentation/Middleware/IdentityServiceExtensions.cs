using CamQuizzBE.Infras.Data;
using CamQuizzBE.Domain.Entities;

namespace CamQuizzBE.Presentation.Middleware;

public static class IdentityServiceExtensions
{
    public static IServiceCollection AddIdentityServices(this IServiceCollection services, IConfiguration config)
    {
        Console.WriteLine("AddIdentityServices method is being called...");

        services.AddIdentityCore<AppUser>(opt =>
        {
            opt.Password.RequireNonAlphanumeric = false;
        })
            .AddRoles<AppRole>()
            .AddRoleManager<RoleManager<AppRole>>()
            .AddEntityFrameworkStores<DataContext>();

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            var tokenKey = config["TokenKey"] ?? throw new Exception("TokenKey not found.");
            Console.WriteLine("JwtBearer configuration starting...");
            Console.WriteLine("TokenKey: " + tokenKey);

            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey)),
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = false,
                RoleClaimType = ClaimTypes.Role
            };

            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var token = context.Request.Headers["Authorization"].ToString();
                    Console.WriteLine($"🔹 Raw Token Received: '{token}'");

                    if (string.IsNullOrEmpty(token))
                    {
                        Console.WriteLine("❌ No token received!");
                    }

                    context.Token = token;

                    return Task.CompletedTask;
                }
            };
        });
        return services;
    }

}
