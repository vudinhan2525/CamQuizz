using System;
using System.Net.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using CamQuizzBE.Presentation.Hubs;
using Microsoft.AspNetCore.Builder;

namespace CamQuizzBE.Tests.Integration;

public class TestHost : IAsyncDisposable
{
    private IHost? _host;
    private TestServer? _testServer;
    public string ServerUrl { get; private set; } = string.Empty;
    public HttpMessageHandler MessageHandler => _testServer?.CreateHandler() 
        ?? throw new InvalidOperationException("Test server not initialized");

    public async Task StartAsync()
    {
        var hostBuilder = CreateHostBuilder();
        _host = await hostBuilder.StartAsync();
        _testServer = _host.GetTestServer();
        ServerUrl = "http://localhost";
    }

    private IHostBuilder CreateHostBuilder()
    {
        return Host.CreateDefaultBuilder()
            .ConfigureWebHost(webBuilder =>
            {
                webBuilder
                    .UseTestServer()
                    .ConfigureServices(services =>
                    {
                        services.AddSignalR();
                        services.AddCors(options =>
                        {
                            options.AddDefaultPolicy(builder =>
                            {
                                builder.SetIsOriginAllowed(_ => true)
                                    .AllowAnyMethod()
                                    .AllowAnyHeader()
                                    .AllowCredentials();
                            });
                        });
                    })
                    .Configure(app =>
                    {
                        app.UseCors();
                        app.UseRouting();
                        app.UseEndpoints(endpoints =>
                        {
                            endpoints.MapHub<QuizHub>("/quizHub");
                        });
                    });
            });
    }

    public async ValueTask DisposeAsync()
    {
        if (_host != null)
        {
            await _host.StopAsync();
            _host.Dispose();
        }
        
        _testServer?.Dispose();
    }
}