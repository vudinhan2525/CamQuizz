using CamQuizzBE.Infras.Data;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Infras.Extensions;
using CamQuizzBE.Presentation.Middleware;
using Microsoft.IdentityModel.Logging;
using Serilog;
var builder = WebApplication.CreateBuilder(args);

// // Log config
builder.Host.UseSerilog((context, configuration) => configuration.ReadFrom.Configuration(context.Configuration));

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
        options.JsonSerializerOptions.DictionaryKeyPolicy = JsonNamingPolicy.SnakeCaseLower;
        options.JsonSerializerOptions.WriteIndented = true;
    });
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration);

IdentityModelEventSource.ShowPII = true;
builder.Services.AddSwaggerGen();
builder.Logging.AddConsole(options =>
{
    options.LogToStandardErrorThreshold = LogLevel.Information;
});
var app = builder.Build();

var logger = app.Services.GetRequiredService<ILogger<Program>>();
var kestrelUrl = builder.Configuration.GetValue<string>("Kestrel:Endpoints:Http:Url");
logger.LogInformation("🚀 Application starting on {Addresses}", kestrelUrl);




app.UseMiddleware<ExceptionMiddleware>();
app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod()
    .WithOrigins("http://localhost:3000"));

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

// Map controller
app.MapControllers();



using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;
try
{
    var context = services.GetRequiredService<DataContext>();
    var userManager = services.GetRequiredService<UserManager<AppUser>>();
    var roleManager = services.GetRequiredService<RoleManager<AppRole>>();
    var scopedLogger = services.GetRequiredService<ILogger<Program>>();

    await context.Database.MigrateAsync();
}
catch (Exception ex)
{
    var scopedLogger = services.GetRequiredService<ILogger<Program>>();
    scopedLogger.LogError(ex, "An error occurred during migration");
}

app.Run();
