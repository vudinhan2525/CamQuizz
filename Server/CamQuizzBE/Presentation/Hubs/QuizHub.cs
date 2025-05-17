using Microsoft.AspNetCore.SignalR;
using CamQuizzBE.Applications.DTOs.Quizzes;
using CamQuizzBE.Applications.DTOs.Questions;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Infras.Data;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;

namespace CamQuizzBE.Presentation.Hubs;

public record RejoinGameRequest(int UserId);

public class NextQuestionRequest
{
    public string RoomId { get; set; } = string.Empty;
    public int UserId { get; set; }
}

public class PauseTimerRequest
{
    public string RoomId { get; set; } = string.Empty;
    public int UserId { get; set; }
}

public class ResumeTimerRequest
{
    public string RoomId { get; set; } = string.Empty;
    public int UserId { get; set; }
}

public class GameState
{
    public bool IsStarted { get; set; }
    public int CurrentQuestionIndex { get; set; } = -1;
    public Dictionary<int, List<string>> PlayerAnswers { get; set; } = new();
    public Dictionary<int, int> PlayerScores { get; set; } = new();
    public CancellationTokenSource? TimerCancellation { get; set; }
    public DateTime? QuestionStartTime { get; set; }
    public double OriginalDuration { get; set; }
    public double TimeRemaining { get; set; }
    public bool IsPaused { get; set; }
}

public class QuizHub : Hub
{
    private static readonly Dictionary<string, RoomDto> _rooms = new();
    private static readonly Dictionary<string, GameState> _games = new();
    private readonly ILogger<QuizHub> _logger;
    private readonly IUserService _userService;
    private readonly IQuizzesService _quizService;
    private readonly IServiceProvider _serviceProvider;

    public QuizHub(
        ILogger<QuizHub> logger,
        IUserService userService,
        IQuizzesService quizService,
        IServiceProvider serviceProvider)
    {
        _logger = logger;
        _userService = userService;
        _quizService = quizService;
        _serviceProvider = serviceProvider;
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("Client Connected: {ConnectionId}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    private void CleanupGameState(string roomId)
    {
        if (_games.TryGetValue(roomId, out var gameState))
        {
            gameState.TimerCancellation?.Cancel();
            gameState.TimerCancellation?.Dispose();
            _games.Remove(roomId);
            _logger.LogInformation("Cleaned up game state for room {RoomId}", roomId);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client Disconnected: {ConnectionId}, Error: {Error}",
            Context.ConnectionId, exception?.Message ?? "None");

        try
        {
            foreach (var room in _rooms.Values)
            {
                var player = room.PlayerList.FirstOrDefault(p => p.ConnectionId == Context.ConnectionId);
                if (player != null)
                {
                    if (_games.ContainsKey(room.RoomId))
                    {
                        _logger.LogInformation("Player {PlayerId} disconnected during game", player.Id);
                        player.ConnectionId = null;
                        await Groups.RemoveFromGroupAsync(Context.ConnectionId, room.RoomId);
                    }
                    else
                    {
                        await LeaveRoom(new LeaveRoomRequest { RoomId = room.RoomId, UserId = player.Id });
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling disconnection");
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task RejoinGame(RejoinGameRequest request)
    {
        try
        {
            var room = _rooms.Values.FirstOrDefault(r => 
                r.PlayerList.Any(p => p.Id == request.UserId) && 
                _games.ContainsKey(r.RoomId));

            if (room == null)
            {
                throw new Exception("No active game found for this user");
            }

            var player = room.PlayerList.First(p => p.Id == request.UserId);
            player.ConnectionId = Context.ConnectionId;

            await Groups.AddToGroupAsync(Context.ConnectionId, room.RoomId);

            var gameState = _games[room.RoomId];
            var quiz = await _quizService.GetQuizByIdAsync(room.QuizId);
            if (quiz?.Questions == null || !quiz.Questions.Any())
            {
                throw new Exception("Quiz or questions not found");
            }
            var questions = quiz.Questions.ToList();
            var currentQuestion = questions[gameState.CurrentQuestionIndex];

            var questionResponse = new GameQuestionResponse
            {
                Id = currentQuestion.Id,
                Content = currentQuestion.Description,
                TimeLimit = currentQuestion.Duration > 0 ? currentQuestion.Duration : 30,
                Options = currentQuestion.Answers.Select((a, index) => new GameQuestionOption 
                { 
                    Label = ((char)('A' + index)).ToString(), 
                    Content = a.Answer 
                }).ToList()
            };

            await Clients.Caller.SendAsync("gameRejoined", new { 
                RoomId = room.RoomId, 
                CurrentQuestion = questionResponse,
                Score = gameState.PlayerScores.GetValueOrDefault(request.UserId, 0),
                IsPaused = gameState.IsPaused,
                TimeRemaining = gameState.TimeRemaining
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejoining game for user {UserId}", request.UserId);
            await Clients.Caller.SendAsync("error", new { Message = "Error rejoining game", Error = ex.Message });
            throw;
        }
    }

    public async Task CreateRoom(CreateRoomRequest request)
    {
        try
        {
            _logger.LogInformation("Creating room for quiz {QuizId} by user {UserId}", request.QuizId, request.UserId);
            
            var quiz = await _quizService.GetQuizByIdAsync(request.QuizId);
            var user = await _userService.GetUserByIdAsync(request.UserId);

            if (quiz == null || user == null)
            {
                throw new Exception("Quiz or user not found");
            }

            var roomId = Guid.NewGuid().ToString();
            var room = new RoomDto
            {
                RoomId = roomId,
                QuizId = request.QuizId,
                HostId = request.UserId,
                PlayerList = new List<PlayerDto>
                {
                    new PlayerDto
                    {
                        Id = user.Id,
                        Name = $"{user.FirstName} {user.LastName}",
                        Avatar = user.PhotoUrl ?? "",
                        Score = 0,
                        ConnectionId = Context.ConnectionId
                    }
                }
            };

            _rooms[roomId] = room;
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
            await Clients.Caller.SendAsync("roomCreated", room);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating room for quiz {QuizId}", request.QuizId);
            await Clients.Caller.SendAsync("error", new { Message = "Error creating room", Error = ex.Message });
            throw;
        }
    }

    public async Task JoinRoom(JoinRoomRequest request)
    {
        try
        {
            _logger.LogInformation("User {UserId} joining room {RoomId}", request.UserId, request.RoomId);

            if (!_rooms.ContainsKey(request.RoomId))
            {
                throw new Exception("Room not found");
            }

            var user = await _userService.GetUserByIdAsync(request.UserId);
            if (user == null)
            {
                throw new Exception("User not found");
            }

            var room = _rooms[request.RoomId];

            if (!room.PlayerList.Any(p => p.Id == request.UserId))
            {
                room.PlayerList.Add(new PlayerDto
                {
                    Id = user.Id,
                    Name = $"{user.FirstName} {user.LastName}",
                    Avatar = user.PhotoUrl ?? "",
                    Score = 0,
                    ConnectionId = Context.ConnectionId
                });
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, room.RoomId);
            await Clients.Group(request.RoomId).SendAsync("playerJoined", room);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error joining room {RoomId}", request.RoomId);
            await Clients.Caller.SendAsync("error", new { Message = "Error joining room", Error = ex.Message });
            throw;
        }
    }

    public async Task LeaveRoom(LeaveRoomRequest request)
    {
        try
        {
            _logger.LogInformation("User {UserId} leaving room {RoomId}", request.UserId, request.RoomId);

            if (!_rooms.ContainsKey(request.RoomId))
            {
                throw new Exception("Room not found");
            }

            var room = _rooms[request.RoomId];
            room.PlayerList.RemoveAll(p => p.Id == request.UserId);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, request.RoomId);

            if (!room.PlayerList.Any())
            {
                _rooms.Remove(request.RoomId);
                CleanupGameState(request.RoomId);
                _logger.LogInformation("Room {RoomId} removed as it is now empty", request.RoomId);
                return;
            }

            if (room.HostId == request.UserId && room.PlayerList.Any())
            {
                room.HostId = room.PlayerList[0].Id;
                _logger.LogInformation("New host {NewHostId} assigned for room {RoomId}", room.HostId, request.RoomId);
            }

            await Clients.Group(request.RoomId).SendAsync("playerLeft", room);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error leaving room {RoomId}", request.RoomId);
            await Clients.Group(request.RoomId).SendAsync("error", new { Message = "Error leaving room", Error = ex.Message });
            throw;
        }
    }

    public async Task StartGame(StartGameRequest request)
    {
        try
        {
            _logger.LogInformation("Starting game in room {RoomId}", request.RoomId);

            if (!_rooms.ContainsKey(request.RoomId))
            {
                throw new Exception("Room not found");
            }

            var room = _rooms[request.RoomId];
            var quiz = await _quizService.GetQuizByIdAsync(room.QuizId);
            if (quiz?.Questions == null || !quiz.Questions.Any())
            {
                throw new Exception("Quiz or questions not found");
            }
            var questions = quiz.Questions.ToList();

            var gameState = new GameState
            {
                IsStarted = true,
                CurrentQuestionIndex = 0,
                QuestionStartTime = DateTime.Now,
                OriginalDuration = quiz.Duration > 0 ? quiz.Duration : 30,
                TimeRemaining = quiz.Duration > 0 ? quiz.Duration : 30,
                IsPaused = false
            };

            var firstQuestion = new GameQuestionResponse
            {
                Id = questions[0].Id,
                Content = questions[0].Description,
                TimeLimit = quiz.Duration > 0 ? quiz.Duration : 30,
                Options = questions[0].Answers.Select((a, index) => new GameQuestionOption 
                { 
                    Label = ((char)('A' + index)).ToString(), 
                    Content = a.Answer 
                }).ToList()
            };

            _games[request.RoomId] = gameState;

            var duration = quiz.Duration > 0 ? quiz.Duration : 30;
            gameState.TimerCancellation = new CancellationTokenSource();
            
            using var scope = _serviceProvider.CreateScope();
            var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<QuizHub>>();
            
            _ = StartQuestionTimer(request.RoomId, duration, gameState);
            await hubContext.Clients.Group(request.RoomId).SendAsync("gameStarted", new { room.RoomId, firstQuestion });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting game in room {RoomId}", request.RoomId);
            using var scope = _serviceProvider.CreateScope();
            var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<QuizHub>>();
            await hubContext.Clients.Group(request.RoomId).SendAsync("error", new { Message = "Error starting game", Error = ex.Message });
            
            // Clean up any created game state
            if (_games.ContainsKey(request.RoomId))
            {
                _games.Remove(request.RoomId);
            }
            throw;
        }
    }

    public async Task SubmitAnswer(SubmitAnswerRequest request)
    {
        try
        {
            _logger.LogInformation("User {UserId} submitting answer for question {QuestionId} in room {RoomId}", 
                request.UserId, request.QuestionId, request.RoomId);

            if (!_rooms.ContainsKey(request.RoomId) || !_games.ContainsKey(request.RoomId))
            {
                throw new Exception("Room or game not found");
            }

            var gameState = _games[request.RoomId];
            var room = _rooms[request.RoomId];

            if (request.QuestionId != gameState.CurrentQuestionIndex + 1)
            {
                _logger.LogWarning("Invalid QuestionId {QuestionId} for current question index {Index} in room {RoomId}",
                    request.QuestionId, gameState.CurrentQuestionIndex, request.RoomId);
                throw new Exception("Invalid question ID");
            }

            gameState.PlayerAnswers[request.UserId] = request.Answer;

            bool allAnswered = room.PlayerList.All(p => gameState.PlayerAnswers.ContainsKey(p.Id) || p.ConnectionId == null);
            if (allAnswered)
            {
                _logger.LogInformation("All players answered or disconnected in room {RoomId}, processing question end", request.RoomId);
                using var scope = _serviceProvider.CreateScope();
                var quizService = scope.ServiceProvider.GetRequiredService<IQuizzesService>();
                var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<QuizHub>>();
                await ProcessQuestionEnd(request.RoomId, hubContext, quizService, triggeredByUserId: request.UserId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting answer for user {UserId} in room {RoomId}", request.UserId, request.RoomId);
            await Clients.Group(request.RoomId).SendAsync("error", new { Message = "Error submitting answer", Error = ex.Message });
            throw;
        }
    }

    public async Task NextQuestion(NextQuestionRequest request)
    {
        try
        {
            _logger.LogInformation("Host {UserId} requesting next question for room {RoomId}", request.UserId, request.RoomId);

            if (!_rooms.ContainsKey(request.RoomId) || !_games.ContainsKey(request.RoomId))
            {
                throw new Exception("Room or game not found");
            }

            var room = _rooms[request.RoomId];
            if (room.HostId != request.UserId)
            {
                throw new Exception("Only the host can request the next question");
            }

            using var scope = _serviceProvider.CreateScope();
            var quizService = scope.ServiceProvider.GetRequiredService<IQuizzesService>();
            var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<QuizHub>>();
            await ProcessQuestionEnd(request.RoomId, hubContext, quizService, triggeredByUserId: request.UserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing next question request for room {RoomId}", request.RoomId);
            await Clients.Group(request.RoomId).SendAsync("error", new { Message = "Error processing next question", Error = ex.Message });
            throw;
        }
    }

    public async Task PauseTimer(PauseTimerRequest request)
    {
        try
        {
            _logger.LogInformation("Host {UserId} requesting to pause timer for room {RoomId}", request.UserId, request.RoomId);

            if (!_rooms.ContainsKey(request.RoomId) || !_games.ContainsKey(request.RoomId))
            {
                throw new Exception("Room or game not found");
            }

            var room = _rooms[request.RoomId];
            if (room.HostId != request.UserId)
            {
                throw new Exception("Only the host can pause the timer");
            }

            var gameState = _games[request.RoomId];
            if (gameState.IsPaused)
            {
                _logger.LogWarning("Timer already paused for room {RoomId}", request.RoomId);
                return;
            }

            if (gameState.QuestionStartTime == null || gameState.TimerCancellation == null)
            {
                throw new Exception("No active question timer found");
            }

            var elapsed = (DateTime.Now - gameState.QuestionStartTime.Value).TotalSeconds;
            gameState.TimeRemaining = Math.Max(0, gameState.OriginalDuration - elapsed);
            gameState.IsPaused = true;

            gameState.TimerCancellation?.Cancel();
            gameState.TimerCancellation?.Dispose();
            gameState.TimerCancellation = null;

            _logger.LogInformation("Timer paused for room {RoomId}, timeRemaining: {TimeRemaining}s", request.RoomId, gameState.TimeRemaining);

            await Clients.Group(request.RoomId).SendAsync("timerPaused", new
            {
                RoomId = request.RoomId,
                TimeRemaining = gameState.TimeRemaining
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error pausing timer for room {RoomId}", request.RoomId);
            await Clients.Group(request.RoomId).SendAsync("error", new { Message = "Error pausing timer", Error = ex.Message });
            throw;
        }
    }

    public async Task ResumeTimer(ResumeTimerRequest request)
    {
        try
        {
            _logger.LogInformation("Host {UserId} requesting to resume timer for room {RoomId}", request.UserId, request.RoomId);

            if (!_rooms.ContainsKey(request.RoomId) || !_games.ContainsKey(request.RoomId))
            {
                throw new Exception("Room or game not found");
            }

            var room = _rooms[request.RoomId];
            if (room.HostId != request.UserId)
            {
                throw new Exception("Only the host can resume the timer");
            }

            var gameState = _games[request.RoomId];
            if (!gameState.IsPaused)
            {
                _logger.LogWarning("Timer not paused for room {RoomId}", request.RoomId);
                return;
            }

            gameState.QuestionStartTime = DateTime.Now;
            gameState.IsPaused = false;

            gameState.TimerCancellation = new CancellationTokenSource();
            
            _ = StartQuestionTimer(request.RoomId, gameState.TimeRemaining, gameState);

            _logger.LogInformation("Timer resumed for room {RoomId}, timeRemaining: {TimeRemaining}s", request.RoomId, gameState.TimeRemaining);

            await Clients.Group(request.RoomId).SendAsync("timerResumed", new
            {
                RoomId = request.RoomId,
                TimeRemaining = gameState.TimeRemaining
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resuming timer for room {RoomId}", request.RoomId);
            await Clients.Group(request.RoomId).SendAsync("error", new { Message = "Error resuming timer", Error = ex.Message });
            throw;
        }
    }

    private async Task StartQuestionTimer(string roomId, double duration, GameState gameState)
    {
        using var scope = _serviceProvider.CreateScope();
        var quizService = scope.ServiceProvider.GetRequiredService<IQuizzesService>();
        var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<QuizHub>>();
        
        try
        {
            await Task.Delay(TimeSpan.FromSeconds(duration), gameState.TimerCancellation.Token);
            
            if (!gameState.IsPaused && _games.ContainsKey(roomId))
            {
                _logger.LogInformation("Timer expired for room {RoomId}", roomId);
                await ProcessQuestionEnd(roomId, hubContext, quizService, isTimeUp: true);
            }
        }
        catch (OperationCanceledException)
        {
            // Timer was cancelled, do nothing
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Timer error for room {RoomId}", roomId);
        }
    }

    private async Task ProcessQuestionEnd(string roomId, IHubContext<QuizHub> hubContext, IQuizzesService quizService, bool isTimeUp = false, int? triggeredByUserId = null)
    {
        try
        {
            _logger.LogInformation("Processing question end for room {RoomId}, isTimeUp: {IsTimeUp}, triggeredByUserId: {TriggeredByUserId}",
                roomId, isTimeUp, triggeredByUserId);

            if (!_games.TryGetValue(roomId, out var gameState) || !_rooms.TryGetValue(roomId, out var room))
            {
                _logger.LogWarning("Room or game state not found for room {RoomId}", roomId);
                return;
            }

            gameState.TimerCancellation?.Cancel();
            gameState.TimerCancellation?.Dispose();
            gameState.TimerCancellation = null;

            var quiz = await quizService.GetQuizByIdAsync(room.QuizId);
            if (quiz?.Questions == null || !quiz.Questions.Any())
            {
                _logger.LogWarning("Quiz or questions not found for room {RoomId}", roomId);
                throw new Exception("Quiz or questions not found");
            }
            var questions = quiz.Questions.ToList();
            if (gameState.CurrentQuestionIndex < 0 || gameState.CurrentQuestionIndex >= questions.Count)
            {
                _logger.LogWarning("Invalid question index {Index} for room {RoomId}", gameState.CurrentQuestionIndex, roomId);
                throw new Exception("Invalid question index");
            }
            var currentQuestion = questions[gameState.CurrentQuestionIndex];

            var correctAnswers = currentQuestion.Answers
                .Select((a, index) => new { Answer = a, Label = ((char)('A' + index)).ToString() })
                .Where(x => x.Answer.IsCorrect)
                .Select(x => x.Label)
                .ToList();

            foreach (var player in room.PlayerList)
            {
                var currentScore = gameState.PlayerScores.GetValueOrDefault(player.Id, 0);
                bool answered = gameState.PlayerAnswers.TryGetValue(player.Id, out var playerAnswer);

                if (answered && 
                    playerAnswer.Count == correctAnswers.Count && 
                    playerAnswer.All(answer => correctAnswers.Contains(answer)))
                {
                    currentScore += currentQuestion.Score;
                }

                gameState.PlayerScores[player.Id] = currentScore;
                player.Score = currentScore;
            }

            gameState.PlayerAnswers.Clear();

            var playerScores = room.PlayerList.Select(p => new PlayerScore
            {
                UserId = p.Id,
                Name = p.Name,
                Score = gameState.PlayerScores.GetValueOrDefault(p.Id, 0)
            }).ToList();

            GameQuestionResponse nextQuestion = null;
            if (gameState.CurrentQuestionIndex < questions.Count - 1)
            {
                var next = questions[gameState.CurrentQuestionIndex + 1];
                nextQuestion = new GameQuestionResponse
                {
                    Id = next.Id,
                    Content = next.Description,
                    TimeLimit = next.Duration > 0 ? next.Duration : 30,
                    Options = next.Answers.Select((a, index) => new GameQuestionOption 
                    { 
                        Label = ((char)('A' + index)).ToString(), 
                        Content = a.Answer 
                    }).ToList()
                };
                gameState.CurrentQuestionIndex++;
                gameState.QuestionStartTime = DateTime.Now;
                gameState.OriginalDuration = next.Duration > 0 ? next.Duration : 30;
                gameState.TimeRemaining = gameState.OriginalDuration;
                gameState.IsPaused = false;

                gameState.TimerCancellation = new CancellationTokenSource();
                
                _ = StartQuestionTimer(roomId, gameState.TimeRemaining, gameState);
            }

            var result = new QuestionResultResponse
            {
                RoomId = roomId,
                QuizId = room.QuizId,
                QuestionId = currentQuestion.Id,
                TrueAnswer = correctAnswers,
                Ranking = playerScores,
                NextQuestion = nextQuestion
            };

            _logger.LogInformation("Sending doneQuestion event for room {RoomId}, question {QuestionId}, nextQuestionId: {NextQuestionId}",
                roomId, currentQuestion.Id, nextQuestion?.Id);
            await hubContext.Clients.Group(roomId).SendAsync("doneQuestion", result);

            if (nextQuestion == null)
            {
                gameState.TimerCancellation?.Cancel();
                gameState.TimerCancellation?.Dispose();
                _games.Remove(roomId);
                _logger.LogInformation("Game ended for room {RoomId}, all questions completed", roomId);

                var quizResult = new QuizResultResponse
                {
                    RoomId = roomId,
                    QuizId = room.QuizId,
                    Ranking = playerScores
                };

                _logger.LogInformation("Sending doneQuiz event for room {RoomId}", roomId);
                await hubContext.Clients.Group(roomId).SendAsync("doneQuiz", quizResult);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing question end for room {RoomId}", roomId);
            await hubContext.Clients.Group(roomId).SendAsync("error", new { Message = "Error processing question end", Error = ex.Message });
            throw;
        }
    }
}