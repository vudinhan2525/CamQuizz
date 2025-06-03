using CamQuizzBE.Infras.Data;
using CamQuizzBE.Domain.Entities;
// using Microsoft.AspNetCore.Authentication;
// using Microsoft.AspNetCore.Authentication.JwtBearer;
// using Microsoft.AspNetCore.Authentication.Google;
// using Microsoft.AspNetCore.Authentication.OAuth;
// using Microsoft.AspNetCore.Identity;
// using Microsoft.IdentityModel.Tokens;
// using System.Security.Claims;
// using System.Text;

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
                ValidateLifetime = true,
                RoleClaimType = ClaimTypes.Role
            };

            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var authHeader = context.Request.Headers["Authorization"].ToString();
                    Console.WriteLine($"🔹 Raw Authorization Header: '{authHeader}'");

                    if (string.IsNullOrEmpty(authHeader))
                    {
                        Console.WriteLine("❌ No authorization header received!");
                        return Task.CompletedTask;
                    }

                    // Extract the token part after "Bearer "
                    if (authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                    {
                        var token = authHeader.Substring("Bearer ".Length).Trim();
                        Console.WriteLine($"🔹 Extracted Token: '{token}'");
                        context.Token = token;
                    }
                    else
                    {
                        Console.WriteLine("❌ Authorization header does not start with 'Bearer'");
                    }
                    return Task.CompletedTask;
                }
            };
        });
        // .AddGoogle(options =>
        // {
        //     var googleAuthConfig = config.GetSection("Authentication:Google");
        //     options.ClientId = googleAuthConfig["ClientId"];
        //     options.ClientSecret = googleAuthConfig["ClientSecret"];
        //     options.CallbackPath = "/api/v1/auth/external-login/callback";
        //     options.SaveTokens = true;

        //     options.Events = new OAuthEvents
        //     {
        //         OnCreatingTicket = context =>
        //         {
        //             var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
        //             logger.LogInformation("Creating ticket for Google auth. State: {State}", context.Properties.Items[".xsrf"]);
        //             return Task.CompletedTask;
        //         },
        //         OnTicketReceived = context =>
        //         {
        //             var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
        //             logger.LogInformation("Google authentication successful for user: {Email}", context.Principal?.FindFirstValue(ClaimTypes.Email));
        //             return Task.CompletedTask;
        //         },
        //         OnRemoteFailure = context =>
        //         {
        //             var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
        //             logger.LogError(context.Failure, "Google authentication failed: {Message}", context.Failure?.Message);
        //             context.Response.StatusCode = 500;
        //             context.Response.ContentType = "text/plain";
        //             return context.Response.WriteAsync($"Authentication failed: {context.Failure?.Message}");
        //         }
        //     };
        // });
        return services;
    }
}
