using Microsoft.AspNetCore.SignalR;
using CamQuizzBE.Applications.DTOs.Quizzes;
using CamQuizzBE.Applications.DTOs.Questions;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Infras.Data;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CamQuizzBE.Presentation.Hubs;

public record CreateRoomRequest(int QuizId, int UserId);
public record JoinRoomRequest(string RoomId, int UserId);
public record LeaveRoomRequest(string RoomId, int UserId);
public record StartGameRequest(string RoomId);
public record SubmitAnswerRequest(string RoomId, int UserId, int? QuestionId, List<string> Answer);
public record RejoinGameRequest(int UserId);
public record NextQuestionRequest(string RoomId, int UserId);
public record PauseTimerRequest(string RoomId, int UserId, bool ShowRanking = false);
public record ResumeTimerRequest(string RoomId, int UserId);

public class PlayerDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
    public int Score { get; set; }
    public string? ConnectionId { get; set; }
}

public class RoomDto
{
    public string RoomId { get; set; } = string.Empty;
    public int QuizId { get; set; }
    public int HostId { get; set; }
    public List<PlayerDto> PlayerList { get; set; } = new();
}

public class GameQuestionOption
{
    public string Label { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}

public class GameQuestionResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public double TimeLimit { get; set; }
    public List<GameQuestionOption> Options { get; set; } = new();
    public string RoomId { get; set; } = string.Empty;
}

public class PlayerScore
{
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Score { get; set; }
}

public class QuestionResultResponse
{
    public string RoomId { get; set; } = string.Empty;
    public int QuizId { get; set; }
    public int QuestionId { get; set; }
    public List<string> TrueAnswer { get; set; } = new();
    public List<PlayerScore> Ranking { get; set; } = new();
    public GameQuestionResponse? NextQuestion { get; set; }
    public bool IsLastQuestion { get; set; }
}

public class QuizResultResponse
{
    public string RoomId { get; set; } = string.Empty;
    public int QuizId { get; set; }
    public List<PlayerScore> Ranking { get; set; } = new();
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
    public bool ShowRanking { get; set; }
    public bool IsEnded { get; set; }
    public DateTime? LastAnswerTime { get; set; }
}

public class QuizHub : Hub
{
    private static readonly Dictionary<string, RoomDto> _rooms = new();
    private static readonly Dictionary<string, GameState> _games = new();
    private static readonly Random _random = new();

    private static string GenerateRoomId()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        return new string(Enumerable.Repeat(chars, 5)
            .Select(s => s[_random.Next(s.Length)]).ToArray());
    }

    private readonly ILogger<QuizHub> _logger;
    private readonly IUserService _userService;
    private readonly IQuizzesService _quizService;
    private readonly IServiceScopeFactory _scopeFactory;

    public QuizHub(
        ILogger<QuizHub> logger,
        IUserService userService,
        IQuizzesService quizService,
        IServiceScopeFactory scopeFactory)
    {
        _logger = logger;
        _userService = userService;
        _quizService = quizService;
        _scopeFactory = scopeFactory;
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
                        await LeaveRoom(new LeaveRoomRequest(room.RoomId, player.Id));
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
                Name = currentQuestion.Name,
                Explanation = currentQuestion.Description,
                TimeLimit = currentQuestion.Duration,
                Options = currentQuestion.Answers.Select((a, index) => new GameQuestionOption
                {
                    Label = ((char)('A' + index)).ToString(),
                    Content = a.Answer
                }).ToList(),
                RoomId = room.RoomId
            };

            await Clients.Caller.SendAsync("gameRejoined", new
            {
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

            var roomId = GenerateRoomId();
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

            await Groups.AddToGroupAsync(Context.ConnectionId, request.RoomId);
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

            var duration = questions[0].Duration;
            if (duration <= 0 || duration > 300)
            {
                _logger.LogError("Invalid duration {Duration} for question {QuestionId}", duration, questions[0].Id);
                throw new Exception($"Invalid duration {duration} for question {questions[0].Id}");
            }
            _logger.LogInformation("First question duration: {Duration}s", duration);

            var gameState = new GameState
            {
                IsStarted = true,
                CurrentQuestionIndex = 0,
                QuestionStartTime = null,  // Will be set after questionStarted event
                OriginalDuration = duration,
                TimeRemaining = duration,
                IsPaused = false,
                ShowRanking = false,
                IsEnded = false,
                LastAnswerTime = null
            };

            _games[request.RoomId] = gameState;

            // Create or update quiz attempts for all players
            using (var dbScope = _scopeFactory.CreateScope())
            {
                var context = dbScope.ServiceProvider.GetRequiredService<DataContext>();
                foreach (var player in room.PlayerList)
                {
                    // Check for existing attempt
                    var existingAttempt = await context.QuizAttempts
                        .FirstOrDefaultAsync(a =>
                            a.QuizId == room.QuizId &&
                            a.UserId == player.Id &&
                            a.RoomId == room.RoomId);

                    if (existingAttempt != null)
                    {
                        _logger.LogInformation(
                            "Found existing attempt {AttemptId} for user {UserId} in room {RoomId}, resetting score",
                            existingAttempt.Id, player.Id, room.RoomId);
                            
                        existingAttempt.Score = 0;
                        existingAttempt.StartTime = DateTime.UtcNow;
                        existingAttempt.EndTime = null;
                        context.QuizAttempts.Update(existingAttempt);
                    }
                    else
                    {
                        var attempt = new QuizAttempts
                        {
                            QuizId = room.QuizId,
                            UserId = player.Id,
                            RoomId = room.RoomId,
                            Score = 0,
                            StartTime = DateTime.UtcNow
                        };
                        await context.QuizAttempts.AddAsync(attempt);
                        _logger.LogInformation(
                            "Created new attempt for user {UserId} in room {RoomId}, quiz {QuizId}",
                            player.Id, room.RoomId, room.QuizId);
                    }
                }

                try
                {
                    await context.SaveChangesAsync();
                    _logger.LogInformation("Successfully saved/updated attempts for {Count} players in room {RoomId}",
                        room.PlayerList.Count, room.RoomId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to save quiz attempts for room {RoomId}", room.RoomId);
                    throw;
                }
            }

            _logger.LogInformation("Starting game for room {RoomId}, question {QuestionId}, duration: {Duration}s",
                request.RoomId, questions[0].Id, duration);

            // Get answers in consistent order for first question
            var orderedAnswers = questions[0].Answers.OrderBy(a => a.Id).ToList();

            var firstQuestion = new GameQuestionResponse
            {
                Id = questions[0].Id,
                Name = questions[0].Name,
                Explanation = questions[0].Description,
                TimeLimit = duration,
                Options = orderedAnswers.Select((a, index) => new GameQuestionOption
                {
                    Label = ((char)('A' + index)).ToString(),
                    Content = a.Answer
                }).ToList(),
                RoomId = room.RoomId
            };

            _logger.LogInformation(
                "First question {QuestionId} options: {Options}",
                questions[0].Id,
                string.Join(", ", orderedAnswers.Select((a, i) => $"{(char)('A' + i)}: {a.Answer} (ID: {a.Id})")));

            using var hubScope = _scopeFactory.CreateScope(); // Renamed to hubScope
            var hubContext = hubScope.ServiceProvider.GetRequiredService<IHubContext<QuizHub>>();

            // Game start sequence
            await hubContext.Clients.Group(request.RoomId).SendAsync("gameStarting");
            await Task.Delay(TimeSpan.FromSeconds(2));
            await hubContext.Clients.Group(request.RoomId).SendAsync("gameStarted", new { room.RoomId, firstQuestion });
            await Task.Delay(TimeSpan.FromSeconds(2));

            // Start first question
            await hubContext.Clients.Group(request.RoomId).SendAsync("questionStarting");
            await Task.Delay(TimeSpan.FromSeconds(2));
            await hubContext.Clients.Group(request.RoomId).SendAsync("questionStarted");

            // Set question start time after announcing question started
            gameState.QuestionStartTime = DateTime.UtcNow;
            _logger.LogInformation(
                "Started first question {QuestionId} at {StartTime} in room {RoomId}",
                questions[0].Id, gameState.QuestionStartTime, request.RoomId);

            // Start timer using StartQuestionTimer
            gameState.TimerCancellation = new CancellationTokenSource();
            _ = Task.Run(() => StartQuestionTimer(request.RoomId, duration, gameState), gameState.TimerCancellation.Token);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting game in room {RoomId}", request.RoomId);
            using var errorScope = _scopeFactory.CreateScope(); // Use unique name
            var hubContext = errorScope.ServiceProvider.GetRequiredService<IHubContext<QuizHub>>();
            await hubContext.Clients.Group(request.RoomId).SendAsync("error", new { Message = "Error starting game", Error = ex.Message });

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
            _logger.LogInformation("User {UserId} submitting answer for question order {QuestionId} in room {RoomId}",
                request.UserId, request.QuestionId, request.RoomId);

            if (!_rooms.TryGetValue(request.RoomId, out var room))
            {
                _logger.LogWarning("Room {RoomId} not found", request.RoomId);
                throw new Exception("Room not found");
            }

            if (!_games.TryGetValue(request.RoomId, out var gameState))
            {
                _logger.LogWarning("Game state for room {RoomId} not found", request.RoomId);
                throw new Exception("Game not found. The quiz may have ended.");
            }

            if (!gameState.IsStarted || gameState.IsEnded)
            {
                _logger.LogWarning("SubmitAnswer rejected for room {RoomId}: Quiz has ended or is not active", request.RoomId);
                throw new Exception("Quiz has ended. Answers cannot be submitted.");
            }

            if (!room.PlayerList.Any(p => p.Id == request.UserId))
            {
                _logger.LogWarning("User {UserId} not found in room {RoomId}", request.UserId, request.RoomId);
                throw new Exception("User not in room");
            }

            if (request.QuestionId != gameState.CurrentQuestionIndex + 1)
            {
                _logger.LogWarning("Invalid question order {QuestionId} for current index {Index} in room {RoomId}",
                    request.QuestionId, gameState.CurrentQuestionIndex, request.RoomId);
                throw new Exception("Invalid question order");
            }

            using (var scope = _scopeFactory.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<DataContext>();
                
                var attempt = await context.QuizAttempts
                    .FirstOrDefaultAsync(a =>
                        a.QuizId == room.QuizId &&
                        a.UserId == request.UserId &&
                        a.RoomId == request.RoomId);

                if (attempt == null)
                {
                    _logger.LogWarning("Quiz attempt not found for user {UserId}, quiz {QuizId}, room {RoomId}",
                        request.UserId, room.QuizId, request.RoomId);
                    throw new Exception("Quiz attempt not found");
                }

                var quiz = await context.Quizzes
                    .Include(q => q.Questions)
                        .ThenInclude(q => q.Answers)
                    .FirstOrDefaultAsync(q => q.Id == room.QuizId);

                if (quiz == null || quiz.Questions == null || !quiz.Questions.Any())
                {
                    throw new Exception("Quiz or questions not found");
                }

                var questions = quiz.Questions.OrderBy(q => q.Id).ToList();
                if (gameState.CurrentQuestionIndex >= questions.Count)
                {
                    throw new Exception("Invalid question index");
                }

                var question = questions[gameState.CurrentQuestionIndex];

                if (question.QuizId != room.QuizId)
                {
                    _logger.LogError("Question {QuestionId} does not belong to quiz {QuizId}", question.Id, room.QuizId);
                    throw new Exception("Question does not belong to this quiz");
                }

                var answers = question.Answers.OrderBy(a => a.Id).ToList();
                var letter = request.Answer.FirstOrDefault();
                int? answerId = null;

                if (!string.IsNullOrEmpty(letter))
                {
                    var letterIndex = letter[0] - 'A';
                    if (letterIndex >= 0 && letterIndex < answers.Count)
                    {
                        answerId = answers[letterIndex].Id;
                    }
                    else
                    {
                        _logger.LogWarning(
                            "Question {QuestionId}: Invalid letter index {Index}, max valid index is {MaxIndex}",
                            question.Id, letterIndex, answers.Count - 1);
                    }
                }

                double answerTime = 0.0;
                if (gameState.QuestionStartTime.HasValue)
                {
                    answerTime = DateTime.UtcNow.Subtract(gameState.QuestionStartTime.Value).TotalSeconds;
                    _logger.LogInformation(
                        "Raw AnswerTime {AnswerTime}s for room {RoomId}, question {QuestionId}, QuestionStartTime={StartTime}",
                        answerTime, request.RoomId, question.Id, gameState.QuestionStartTime.Value);
                    if (answerTime < 0)
                    {
                        _logger.LogWarning("Negative AnswerTime {AnswerTime}s for room {RoomId}, question {QuestionId}. Setting to 0",
                            answerTime, request.RoomId, question.Id);
                        answerTime = 0.0;
                    }
                    else if (answerTime > question.Duration)
                    {
                        _logger.LogWarning("AnswerTime {AnswerTime}s exceeds duration {Duration}s for room {RoomId}, question {QuestionId}. Capping at duration",
                            answerTime, question.Duration, request.RoomId, question.Id);
                        answerTime = question.Duration;
                    }
                }
                else
                {
                    _logger.LogWarning("QuestionStartTime is null for room {RoomId}, question {QuestionId}. Using AnswerTime=0",
                        request.RoomId, question.Id);
                }

                // Check for existing answer
                var existingAnswer = await context.UserAnswers
                    .FirstOrDefaultAsync(ua =>
                        ua.AttemptId == attempt.Id &&
                        ua.QuestionId == question.Id);

                if (existingAnswer != null)
                {
                    _logger.LogInformation(
                        "Updating existing answer for attempt {AttemptId}, question {QuestionId}",
                        attempt.Id, question.Id);
                    existingAnswer.AnswerId = answerId;
                    existingAnswer.AnswerTime = answerTime;
                    context.UserAnswers.Update(existingAnswer);
                }
                else
                {
                    var userAnswer = new UserAnswers
                    {
                        AttemptId = attempt.Id,
                        QuestionId = question.Id,
                        AnswerId = answerId,
                        AnswerTime = answerTime
                    };
                    await context.UserAnswers.AddAsync(userAnswer);
                }

                try
                {
                    await context.SaveChangesAsync();
                    _logger.LogInformation(
                        "Saved user answer for question {QuestionId}: AnswerId={AnswerId}, AttemptId={AttemptId}, AnswerTime={AnswerTime}s",
                        question.Id, answerId, attempt.Id, answerTime);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to save UserAnswers for attempt {AttemptId}, question {QuestionId}",
                        attempt.Id, question.Id);
                    throw;
                }
            }

            string playerName;
            lock (gameState)
            {
                gameState.PlayerAnswers[request.UserId] = request.Answer;
                playerName = room.PlayerList.First(p => p.Id == request.UserId).Name;
            }
            
            await Clients.GroupExcept(request.RoomId, Context.ConnectionId).SendAsync("playerAnswered", new
            {
                PlayerId = request.UserId,
                PlayerName = playerName
            });

            gameState.LastAnswerTime = DateTime.UtcNow;
            gameState.ShowRanking = true;

            bool allAnswered = room.PlayerList.All(p => gameState.PlayerAnswers.ContainsKey(p.Id) || p.ConnectionId == null);
            if (allAnswered)
            {
                _logger.LogInformation("All players answered or disconnected in room {RoomId}, processing question end", request.RoomId);
                gameState.TimerCancellation?.Cancel();
                gameState.TimerCancellation?.Dispose();
                gameState.TimerCancellation = null;

                using var scope = _scopeFactory.CreateScope();
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
                _logger.LogWarning("Room or game not found for room {RoomId}", request.RoomId);
                throw new Exception("Room or game not found");
            }

            var room = _rooms[request.RoomId];
            var gameState = _games[request.RoomId];

            if (room.HostId != request.UserId)
            {
                _logger.LogWarning("User {UserId} is not the host for room {RoomId}", request.UserId, request.RoomId);
                throw new Exception("Only the host can request the next question");
            }

            if (gameState.IsEnded)
            {
                _logger.LogWarning("NextQuestion rejected for room {RoomId}: Quiz has ended", request.RoomId);
                throw new Exception("Quiz has ended. No more questions available.");
            }

            gameState.TimerCancellation?.Cancel();
            gameState.TimerCancellation?.Dispose();
            gameState.TimerCancellation = null;

            using var scope = _scopeFactory.CreateScope();
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

            var elapsed = (DateTime.UtcNow - gameState.QuestionStartTime.Value).TotalSeconds;
            gameState.TimeRemaining = Math.Max(0, gameState.OriginalDuration - elapsed);
            gameState.IsPaused = true;

            gameState.TimerCancellation?.Cancel();
            gameState.TimerCancellation?.Dispose();
            gameState.TimerCancellation = null;

            _logger.LogInformation("Timer paused for room {RoomId}, timeRemaining: {TimeRemaining}s", request.RoomId, gameState.TimeRemaining);

            gameState.ShowRanking = request.ShowRanking;
            if (request.ShowRanking)
            {
                var playerScores = room.PlayerList.Select(p => new PlayerScore
                {
                    UserId = p.Id,
                    Name = p.Name,
                    Score = gameState.PlayerScores.GetValueOrDefault(p.Id, 0)
                }).OrderByDescending(p => p.Score).ToList();

                await Clients.Group(request.RoomId).SendAsync("showingRanking");
                await Task.Delay(TimeSpan.FromSeconds(1));
                await Clients.Group(request.RoomId).SendAsync("updateRanking", playerScores);
            }

            await Clients.Group(request.RoomId).SendAsync("timerPaused", new
            {
                RoomId = request.RoomId,
                TimeRemaining = gameState.TimeRemaining,
                ShowRanking = request.ShowRanking
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
            await Clients.Group(request.RoomId).SendAsync("timerResuming");
            await Task.Delay(TimeSpan.FromSeconds(1));

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

            gameState.QuestionStartTime = DateTime.UtcNow;
            gameState.IsPaused = false;

            gameState.TimerCancellation = new CancellationTokenSource();

            // Start timer using StartQuestionTimer
            _ = Task.Run(() => StartQuestionTimer(request.RoomId, gameState.TimeRemaining, gameState), gameState.TimerCancellation.Token);

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
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<QuizHub>>();

            _logger.LogInformation("Starting timer for room {RoomId}, duration: {Duration}s", roomId, duration);
            if (duration <= 0 || duration > 300)
            {
                _logger.LogError("Invalid duration {Duration} in StartQuestionTimer for room {RoomId}", duration, roomId);
                throw new Exception($"Invalid duration {duration}");
            }

            gameState.QuestionStartTime = DateTime.UtcNow;
            gameState.TimeRemaining = duration;

            for (int time = (int)Math.Ceiling(duration); time >= 0 && !gameState.TimerCancellation.Token.IsCancellationRequested; time--)
            {
                _logger.LogDebug("Timer tick for room {RoomId}, time: {Time}s", roomId, time);
                gameState.TimeRemaining = time;
                await hubContext.Clients.Group(roomId).SendAsync("timerUpdate", new
                {
                    RoomId = roomId,
                    TimeRemaining = time
                });
                if (time > 0)
                {
                    await Task.Delay(1000, gameState.TimerCancellation.Token);
                }
            }

            if (!gameState.IsPaused && _games.ContainsKey(roomId) && !gameState.IsEnded)
            {
                _logger.LogInformation("Timer expired for room {RoomId}", roomId);
                using var quizScope = _scopeFactory.CreateScope();
                var quizService = quizScope.ServiceProvider.GetRequiredService<IQuizzesService>();
                await ProcessQuestionEnd(roomId, hubContext, quizService, isTimeUp: true);
            }
            else
            {
                _logger.LogInformation("Timer stopped for room {RoomId}: IsPaused={IsPaused}, GameExists={GameExists}, IsEnded={IsEnded}",
                    roomId, gameState.IsPaused, _games.ContainsKey(roomId), gameState.IsEnded);
            }
        }
        catch (OperationCanceledException)
        {
            _logger.LogInformation("Timer cancelled for room {RoomId}", roomId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Timer error for room {RoomId}", roomId);
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<QuizHub>>();
                await hubContext.Clients.Group(roomId).SendAsync("error",
                    new { Message = "Timer error", Error = ex.Message });
            }
            catch (Exception logEx)
            {
                _logger.LogError(logEx, "Failed to send error for room {RoomId}", roomId);
            }
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

            using var scope = _scopeFactory.CreateScope();
            var scopedQuizService = scope.ServiceProvider.GetRequiredService<IQuizzesService>();

            var quiz = await scopedQuizService.GetQuizByIdAsync(room.QuizId);
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

            // Get answers in consistent order
            var orderedAnswers = currentQuestion.Answers.OrderBy(a => a.Id).ToList();

            // Map correct answers to letters based on ordered position
            var correctAnswers = orderedAnswers
                .Select((a, index) => new { Answer = a, Label = ((char)('A' + index)).ToString() })
                .Where(x => x.Answer.IsCorrect)
                .Select(x => x.Label)
                .ToList();

            // _logger.LogInformation(
            //     "Question {QuestionId} answers: {Answers}, Correct answers: {CorrectAnswers}",
            //     currentQuestion.Id,
            //     string.Join(", ", orderedAnswers.Select((a, i) => $"{(char)('A' + i)}: {a.Answer} (ID: {a.Id})")),
            //     string.Join(", ", correctAnswers));

            foreach (var player in room.PlayerList)
            {
                var currentScore = gameState.PlayerScores.GetValueOrDefault(player.Id, 0);
                if (gameState.PlayerAnswers.TryGetValue(player.Id, out var playerAnswer))
                {
                    _logger.LogInformation("Player {PlayerId} answered: [{Answers}]", player.Id, string.Join(",", playerAnswer));

                    var isCorrect = playerAnswer != null &&
                                    playerAnswer.Count > 0 &&
                                    playerAnswer.All(a => correctAnswers.Contains(a)) &&
                                    playerAnswer.Count == correctAnswers.Count;

                    if (isCorrect)
                    {
                        currentScore += currentQuestion.Score;
                        _logger.LogInformation("Player {PlayerId} scored {Score} points for question {QuestionId}",
                            player.Id, currentQuestion.Score, currentQuestion.Id);
                    }
                    else
                    {
                        _logger.LogInformation("Player {PlayerId} did not score for question {QuestionId}",
                            player.Id, currentQuestion.Id);
                    }
                }
                else
                {
                    _logger.LogInformation("Player {PlayerId} did not submit an answer for question {QuestionId}",
                        player.Id, currentQuestion.Id);
                }

                gameState.PlayerScores[player.Id] = currentScore;
                player.Score = currentScore;

                using (var dbScope = _scopeFactory.CreateScope())
                {
                    var context = dbScope.ServiceProvider.GetRequiredService<DataContext>();
                    var attempt = await context.QuizAttempts
                        .FirstOrDefaultAsync(a =>
                            a.QuizId == room.QuizId &&
                            a.UserId == player.Id &&
                            a.RoomId == room.RoomId);
                    if (attempt != null)
                    {
                        attempt.Score = currentScore;
                        context.QuizAttempts.Update(attempt);
                        await context.SaveChangesAsync();
                    }
                }
            }

            var playerAnswers = new Dictionary<int, List<string>>(gameState.PlayerAnswers);
            await hubContext.Clients.Group(roomId).SendAsync("showingResult", new
            {
                QuestionId = currentQuestion.Id,
                TrueAnswer = correctAnswers,
                YourAnswer = playerAnswers,
                Duration = 500
            });

            gameState.PlayerAnswers.Clear();
            await Task.Delay(TimeSpan.FromMilliseconds(500));

            var playerScores = room.PlayerList.Select(p => new PlayerScore
            {
                UserId = p.Id,
                Name = p.Name,
                Score = gameState.PlayerScores.GetValueOrDefault(p.Id, 0)
            }).ToList();

            await hubContext.Clients.Group(roomId).SendAsync("showingRanking");
            await Task.Delay(TimeSpan.FromSeconds(1));
            await hubContext.Clients.Group(roomId).SendAsync("updateRanking", playerScores);
            await Task.Delay(TimeSpan.FromSeconds(1));

            GameQuestionResponse nextQuestion = null;
            bool hasNextQuestion = gameState.CurrentQuestionIndex < questions.Count - 1;

            if (hasNextQuestion)
            {
                var next = questions[gameState.CurrentQuestionIndex + 1];
                var nextDuration = next.Duration;
                if (nextDuration <= 0 || nextDuration > 300)
                {
                    _logger.LogError("Invalid duration {Duration} for question {QuestionId}", nextDuration, next.Id);
                    throw new Exception($"Invalid duration {nextDuration} for question {next.Id}");
                }
                _logger.LogInformation("Next question duration: {Duration}s", nextDuration);
                // Get answers in consistent order for next question
                var nextOrderedAnswers = next.Answers.OrderBy(a => a.Id).ToList();

                nextQuestion = new GameQuestionResponse
                {
                    Id = next.Id,
                    Name = next.Name,
                    Explanation = next.Description,
                    TimeLimit = nextDuration,
                    Options = nextOrderedAnswers.Select((a, index) => new GameQuestionOption
                    {
                        Label = ((char)('A' + index)).ToString(),
                        Content = a.Answer
                    }).ToList(),
                    RoomId = room.RoomId
                };
                gameState.CurrentQuestionIndex++;
                gameState.OriginalDuration = nextDuration;
                gameState.TimeRemaining = nextDuration;
                gameState.IsPaused = false;
                gameState.ShowRanking = false;
            }

            var result = new QuestionResultResponse
            {
                RoomId = roomId,
                QuizId = room.QuizId,
                QuestionId = currentQuestion.Id,
                TrueAnswer = correctAnswers,
                Ranking = playerScores,
                NextQuestion = nextQuestion,
                IsLastQuestion = !hasNextQuestion
            };

            _logger.LogInformation("Sending doneQuestion event for room {RoomId}, question {QuestionId}, nextQuestionId: {NextQuestionId}",
                roomId, currentQuestion.Id, nextQuestion?.Id);
            await hubContext.Clients.Group(roomId).SendAsync("doneQuestion", result);

            if (hasNextQuestion)
            {
                await hubContext.Clients.Group(roomId).SendAsync("questionStarting");
                await Task.Delay(TimeSpan.FromSeconds(2));

                // Reset state for next question
                gameState.QuestionStartTime = null; // Clear old time
                gameState.PlayerAnswers.Clear();

                await hubContext.Clients.Group(roomId).SendAsync("questionStarted");

                // Set new start time after announcing question start
                gameState.QuestionStartTime = DateTime.UtcNow; // Already incremented CurrentQuestionIndex at line 1108
                _logger.LogInformation(
                    "Started question {QuestionId} at {StartTime} in room {RoomId}",
                    nextQuestion.Id,
                    gameState.QuestionStartTime,
                    roomId);

                gameState.TimerCancellation = new CancellationTokenSource();
                _ = Task.Run(() => StartQuestionTimer(roomId, nextQuestion.TimeLimit, gameState), gameState.TimerCancellation.Token);

                _logger.LogInformation(
                    "Starting next question {QuestionId} at {StartTime} in room {RoomId}",
                    nextQuestion.Id, gameState.QuestionStartTime, roomId);
            }
            else
            {
                var quizResult = new QuizResultResponse
                {
                    RoomId = roomId,
                    QuizId = room.QuizId,
                    Ranking = playerScores
                };

                _logger.LogInformation("Quiz ending for room {RoomId}", roomId);

                // Update EndTime for all attempts in this room
                using (var dbScope = _scopeFactory.CreateScope())
                {
                    var context = dbScope.ServiceProvider.GetRequiredService<DataContext>();
                    var attempts = await context.QuizAttempts
                        .Where(a => a.RoomId == roomId)
                        .ToListAsync();

                    foreach (var attempt in attempts)
                    {
                        attempt.EndTime = DateTime.UtcNow;
                        context.QuizAttempts.Update(attempt);
                    }

                    await context.SaveChangesAsync();
                    _logger.LogInformation("Updated EndTime for {Count} attempts in room {RoomId}",
                        attempts.Count, roomId);
                }

                await hubContext.Clients.Group(roomId).SendAsync("doneQuiz", quizResult);
                gameState.IsEnded = true;

                await Task.Delay(TimeSpan.FromSeconds(5));
                _games.Remove(roomId);
                _logger.LogInformation("Game ended and attempts finalized for room {RoomId}", roomId);
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