using CamQuizzBE.Infras.Data;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Presentation.Middleware;
using CamQuizzBE.Presentation.Hubs;
using Microsoft.IdentityModel.Logging;
using Serilog;
using System.Text.Json;
using System.Text.Json.Serialization;
var builder = WebApplication.CreateBuilder(args);

// Configure logging using Serilog
builder.Host.UseSerilog((context, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .MinimumLevel.Debug()
    .WriteTo.Console(
        outputTemplate: "[{Timestamp:HH:mm:ss.fff} {Level:u3}] {Message:lj}{NewLine}{Exception}"
    )
);

// Add SignalR with handshake configuration
builder.Services.AddSignalR(hubOptions =>
{
    hubOptions.EnableDetailedErrors = true;
    hubOptions.HandshakeTimeout = TimeSpan.FromSeconds(30);
    hubOptions.KeepAliveInterval = TimeSpan.FromSeconds(15);
})
.AddJsonProtocol(options =>
{
    options.PayloadSerializerOptions.PropertyNamingPolicy = null;
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.SetIsOriginAllowed(_ => true)
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
        options.JsonSerializerOptions.DictionaryKeyPolicy = JsonNamingPolicy.SnakeCaseLower;
        options.JsonSerializerOptions.WriteIndented = true;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        // options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.Preserve;
    });
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration);

IdentityModelEventSource.ShowPII = true;
builder.Services.AddSwaggerGen();
// Remove duplicate logging configuration
var app = builder.Build();

var logger = app.Services.GetRequiredService<ILogger<Program>>();
var kestrelUrl = builder.Configuration.GetValue<string>("Kestrel:Endpoints:Http:Url");
logger.LogInformation("🚀 Application starting on {Addresses}", kestrelUrl);




app.UseMiddleware<ExceptionMiddleware>();
// app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod()
//     .WithOrigins("http://localhost:3000"));
app.UseCors();
app.UseRouting();

// builder.Services.Configure<CookiePolicyOptions>(options =>
// {
//     options.CheckConsentNeeded = context => false; // Adjust for GDPR if needed
//     options.MinimumSameSitePolicy = SameSiteMode.None; // Allow cross-site cookies
//     options.Secure = CookieSecurePolicy.Always; // Enforce HTTPS
// });

// app.UseCookiePolicy();
app.UseAuthentication();
app.UseAuthorization();

// Enable log for request
app.UseSerilogRequestLogging();

// Enable Swagger middleware in the request pipeline
app.UseSwagger();

app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
    c.RoutePrefix = string.Empty;
});
// Add endpoints
// Configure endpoints
app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
    endpoints.MapHub<QuizHub>("/quizHub");
    endpoints.MapHub<GroupChatHub>("/groupChat"); 
    endpoints.MapHub<TmpHub>("/tmpHub");
});





using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;
try
{
    var context = services.GetRequiredService<DataContext>();
    var userManager = services.GetRequiredService<UserManager<AppUser>>();
    var roleManager = services.GetRequiredService<RoleManager<AppRole>>();
    var scopedLogger = services.GetRequiredService<ILogger<Program>>();

    await context.Database.MigrateAsync();
    await Seed.SeedGenres(context);  // Seed genres first
    await Seed.SeedUsers(context, userManager, roleManager);

}
catch (Exception ex)
{
    var scopedLogger = services.GetRequiredService<ILogger<Program>>();
    scopedLogger.LogError(ex, "An error occurred during migration");
}

app.Run();
