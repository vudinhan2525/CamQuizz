// using Microsoft.AspNetCore.SignalR;
// using CamQuizzBE.Applications.DTOs.Quizzes;
// using CamQuizzBE.Applications.DTOs.Questions;
// using CamQuizzBE.Domain.Interfaces;
// using CamQuizzBE.Infras.Data;
// using Microsoft.Extensions.DependencyInjection;
// using System;
// using System.Collections.Generic;
// using System.Linq;
// using System.Threading;
// using System.Threading.Tasks;

// namespace CamQuizzBE.Presentation.Hubs;

// public record CreateRoomRequest(int QuizId, int UserId);
// public record JoinRoomRequest(string RoomId, int UserId);
// public record LeaveRoomRequest(string RoomId, int UserId);
// public record StartGameRequest(string RoomId);
// public record SubmitAnswerRequest(string RoomId, int UserId, int QuestionId, List<string> Answer);
// public record RejoinGameRequest(int UserId);
// public record NextQuestionRequest(string RoomId, int UserId);
// public record PauseTimerRequest(string RoomId, int UserId);
// public record ResumeTimerRequest(string RoomId, int UserId);

// public class PlayerDto
// {
//     public int Id { get; set; }
//     public string Name { get; set; } = string.Empty;
//     public string Avatar { get; set; } = string.Empty;
//     public int Score { get; set; }
//     public string? ConnectionId { get; set; }
// }

// public class RoomDto
// {
//     public string RoomId { get; set; } = string.Empty;
//     public int QuizId { get; set; }
//     public int HostId { get; set; }
//     public List<PlayerDto> PlayerList { get; set; } = new();
// }

// public class GameQuestionOption
// {
//     public string Label { get; set; } = string.Empty;
//     public string Content { get; set; } = string.Empty;
// }

// public class GameQuestionResponse
// {
//     public int Id { get; set; }
//     public string Name { get; set; } = string.Empty;
//     public string Explanation { get; set; } = string.Empty;
//     public double TimeLimit { get; set; }
//     public List<GameQuestionOption> Options { get; set; } = new();
//     public string RoomId { get; set; } = string.Empty;
// }

// public class PlayerScore
// {
//     public int UserId { get; set; }
//     public string Name { get; set; } = string.Empty;
//     public int Score { get; set; }
// }

// public class QuestionResultResponse
// {
//     public string RoomId { get; set; } = string.Empty;
//     public int QuizId { get; set; }
//     public int QuestionId { get; set; }
//     public List<string> TrueAnswer { get; set; } = new();
//     public List<PlayerScore> Ranking { get; set; } = new();
//     public GameQuestionResponse? NextQuestion { get; set; }
//     public bool IsLastQuestion { get; set; }
// }

// public class QuizResultResponse
// {
//     public string RoomId { get; set; } = string.Empty;
//     public int QuizId { get; set; }
//     public List<PlayerScore> Ranking { get; set; } = new();
// }

// public class GameState
// {
//     public bool IsStarted { get; set; }
//     public int CurrentQuestionIndex { get; set; } = -1;
//     public Dictionary<int, List<string>> PlayerAnswers { get; set; } = new();
//     public Dictionary<int, int> PlayerScores { get; set; } = new();
//     public CancellationTokenSource? TimerCancellation { get; set; }
//     public DateTime? QuestionStartTime { get; set; }
//     public double OriginalDuration { get; set; }
//     public double TimeRemaining { get; set; }
//     public bool IsPaused { get; set; }
//     public bool ShowRanking { get; set; }
//     public bool IsEnded { get; set; }
//     public DateTime? LastAnswerTime { get; set; }
// }

// public class QuizHub : Hub
// {
//     private static readonly Dictionary<string, RoomDto> _rooms = new();
//     private static readonly Dictionary<string, GameState> _games = new();
//     private static readonly Random _random = new();

//     private static string GenerateRoomId()
//     {
//         const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
//         return new string(Enumerable.Repeat(chars, 5)
//             .Select(s => s[_random.Next(s.Length)]).ToArray());
//     }

//     private readonly ILogger<QuizHub> _logger;
//     private readonly IUserService _userService;
//     private readonly IQuizzesService _quizService;
//     private readonly IServiceProvider _serviceProvider;

//     public QuizHub(
//         ILogger<QuizHub> logger,
//         IUserService userService,
//         IQuizzesService quizService,
//         IServiceProvider serviceProvider)
//     {
//         _logger = logger;
//         _userService = userService;
//         _quizService = quizService;
//         _serviceProvider = serviceProvider;
//     }

//     public override async Task OnConnectedAsync()
//     {
//         _logger.LogInformation("Client Connected: {ConnectionId}", Context.ConnectionId);
//         await base.OnConnectedAsync();
//     }

//     private void CleanupGameState(string roomId)
//     {
//         if (_games.TryGetValue(roomId, out var gameState))
//         {
//             gameState.TimerCancellation?.Cancel();
//             gameState.TimerCancellation?.Dispose();
//             _games.Remove(roomId);
//             _logger.LogInformation("Cleaned up game state for room {RoomId}", roomId);
//         }
//     }

//     public override async Task OnDisconnectedAsync(Exception? exception)
//     {
//         _logger.LogInformation("Client Disconnected: {ConnectionId}, Error: {Error}",
//             Context.ConnectionId, exception?.Message ?? "None");

//         try
//         {
//             foreach (var room in _rooms.Values)
//             {
//                 var player = room.PlayerList.FirstOrDefault(p => p.ConnectionId == Context.ConnectionId);
//                 if (player != null)
//                 {
//                     if (_games.ContainsKey(room.RoomId))
//                     {
//                         _logger.LogInformation("Player {PlayerId} disconnected during game", player.Id);
//                         player.ConnectionId = null;
//                         await Groups.RemoveFromGroupAsync(Context.ConnectionId, room.RoomId);
//                     }
//                     else
//                     {
//                         await LeaveRoom(new LeaveRoomRequest(room.RoomId, player.Id));
//                     }
//                 }
//             }
//         }
//         catch (Exception ex)
//         {
//             _logger.LogError(ex, "Error handling disconnection");
//         }

//         await base.OnDisconnectedAsync(exception);
//     }

//     public async Task RejoinGame(RejoinGameRequest request)
//     {
//         try
//         {
//             var room = _rooms.Values.FirstOrDefault(r =>
//                 r.PlayerList.Any(p => p.Id == request.UserId) &&
//                 _games.ContainsKey(r.RoomId));

//             if (room == null)
//             {
//                 throw new Exception("No active game found for this user");
//             }

//             var player = room.PlayerList.First(p => p.Id == request.UserId);
//             player.ConnectionId = Context.ConnectionId;

//             await Groups.AddToGroupAsync(Context.ConnectionId, room.RoomId);

//             var gameState = _games[room.RoomId];
//             var quiz = await _quizService.GetQuizByIdAsync(room.QuizId);
//             if (quiz?.Questions == null || !quiz.Questions.Any())
//             {
//                 throw new Exception("Quiz or questions not found");
//             }
//             var questions = quiz.Questions.ToList();
//             var currentQuestion = questions[gameState.CurrentQuestionIndex];

//             var questionResponse = new GameQuestionResponse
//             {
//                 Id = currentQuestion.Id,
//                 Name = currentQuestion.Name,
//                 Explanation = currentQuestion.Description,
//                 TimeLimit = 30, // Hardcoded for testing
//                 Options = currentQuestion.Answers.Select((a, index) => new GameQuestionOption
//                 {
//                     Label = ((char)('A' + index)).ToString(),
//                     Content = a.Answer
//                 }).ToList(),
//                 RoomId = room.RoomId
//             };

//             await Clients.Caller.SendAsync("gameRejoined", new
//             {
//                 RoomId = room.RoomId,
//                 CurrentQuestion = questionResponse,
//                 Score = gameState.PlayerScores.GetValueOrDefault(request.UserId, 0),
//                 IsPaused = gameState.IsPaused,
//                 TimeRemaining = gameState.TimeRemaining
//             });
//         }
//         catch (Exception ex)
//         {
//             _logger.LogError(ex, "Error rejoining game for user {UserId}", request.UserId);
//             await Clients.Caller.SendAsync("error", new { Message = "Error rejoining game", Error = ex.Message });
//             throw;
//         }
//     }

//     public async Task CreateRoom(CreateRoomRequest request)
//     {
//         try
//         {
//             _logger.LogInformation("Creating room for quiz {QuizId} by user {UserId}", request.QuizId, request.UserId);

//             var quiz = await _quizService.GetQuizByIdAsync(request.QuizId);
//             var user = await _userService.GetUserByIdAsync(request.UserId);

//             if (quiz == null || user == null)
//             {
//                 throw new Exception("Quiz or user not found");
//             }

//             var roomId = GenerateRoomId();
//             var room = new RoomDto
//             {
//                 RoomId = roomId,
//                 QuizId = request.QuizId,
//                 HostId = request.UserId,
//                 PlayerList = new List<PlayerDto>
//                 {
//                     new PlayerDto
//                     {
//                         Id = user.Id,
//                         Name = $"{user.FirstName} {user.LastName}",
//                         Avatar = user.PhotoUrl ?? "",
//                         Score = 0,
//                         ConnectionId = Context.ConnectionId
//                     }
//                 }
//             };

//             _rooms[roomId] = room;
//             await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
//             await Clients.Caller.SendAsync("roomCreated", room);
//         }
//         catch (Exception ex)
//         {
//             _logger.LogError(ex, "Error creating room for quiz {QuizId}", request.QuizId);
//             await Clients.Caller.SendAsync("error", new { Message = "Error creating room", Error = ex.Message });
//             throw;
//         }
//     }

//     public async Task JoinRoom(JoinRoomRequest request)
//     {
//         try
//         {
//             _logger.LogInformation("User {UserId} joining room {RoomId}", request.UserId, request.RoomId);

//             if (!_rooms.ContainsKey(request.RoomId))
//             {
//                 throw new Exception("Room not found");
//             }

//             var user = await _userService.GetUserByIdAsync(request.UserId);
//             if (user == null)
//             {
//                 throw new Exception("User not found");
//             }

//             var room = _rooms[request.RoomId];

//             if (!room.PlayerList.Any(p => p.Id == request.UserId))
//             {
//                 room.PlayerList.Add(new PlayerDto
//                 {
//                     Id = user.Id,
//                     Name = $"{user.FirstName} {user.LastName}",
//                     Avatar = user.PhotoUrl ?? "",
//                     Score = 0,
//                     ConnectionId = Context.ConnectionId
//                 });
//             }

//             await Groups.AddToGroupAsync(Context.ConnectionId, room.RoomId);
//             await Clients.Group(request.RoomId).SendAsync("playerJoined", room);
//         }
//         catch (Exception ex)
//         {
//             _logger.LogError(ex, "Error joining room {RoomId}", request.RoomId);
//             await Clients.Caller.SendAsync("error", new { Message = "Error joining room", Error = ex.Message });
//             throw;
//         }
//     }

//     public async Task LeaveRoom(LeaveRoomRequest request)
//     {
//         try
//         {
//             _logger.LogInformation("User {UserId} leaving room {RoomId}", request.UserId, request.RoomId);

//             if (!_rooms.ContainsKey(request.RoomId))
//             {
//                 throw new Exception("Room not found");
//             }

//             var room = _rooms[request.RoomId];
//             room.PlayerList.RemoveAll(p => p.Id == request.UserId);
//             await Groups.RemoveFromGroupAsync(Context.ConnectionId, request.RoomId);

//             if (!room.PlayerList.Any())
//             {
//                 _rooms.Remove(request.RoomId);
//                 CleanupGameState(request.RoomId);
//                 _logger.LogInformation("Room {RoomId} removed as it is now empty", request.RoomId);
//                 return;
//             }

//             if (room.HostId == request.UserId && room.PlayerList.Any())
//             {
//                 room.HostId = room.PlayerList[0].Id;
//                 _logger.LogInformation("New host {NewHostId} assigned for room {RoomId}", room.HostId, request.RoomId);
//             }

//             await Clients.Group(request.RoomId).SendAsync("playerLeft", room);
//         }
//         catch (Exception ex)
//         {
//             _logger.LogError(ex, "Error leaving room {RoomId}", request.RoomId);
//             await Clients.Group(request.RoomId).SendAsync("error", new { Message = "Error leaving room", Error = ex.Message });
//             throw;
//         }
//     }

//     public async Task StartGame(StartGameRequest request)
//     {
//         try
//         {
//             _logger.LogInformation("Starting game in room {RoomId}", request.RoomId);

//             if (!_rooms.ContainsKey(request.RoomId))
//             {
//                 throw new Exception("Room not found");
//             }

//             var room = _rooms[request.RoomId];
//             var quiz = await _quizService.GetQuizByIdAsync(room.QuizId);
//             if (quiz?.Questions == null || !quiz.Questions.Any())
//             {
//                 throw new Exception("Quiz or questions not found");
//             }
//             var questions = quiz.Questions.ToList();

//             var gameState = new GameState
//             {
//                 IsStarted = true,
//                 CurrentQuestionIndex = 0,
//                 QuestionStartTime = DateTime.Now,
//                 OriginalDuration = 30, // Hardcoded for testing
//                 TimeRemaining = 30, // Hardcoded for testing
//                 IsPaused = false,
//                 ShowRanking = false,
//                 IsEnded = false,
//                 LastAnswerTime = null
//             };

//             _games[request.RoomId] = gameState;

//             var duration = 30; // Hardcoded for testing
//             _logger.LogInformation("Starting game for room {RoomId}, question {QuestionId}, duration: {Duration}s",
//                 request.RoomId, questions[0].Id, duration);

//             var firstQuestion = new GameQuestionResponse
//             {
//                 Id = questions[0].Id,
//                 Name = questions[0].Name,
//                 Explanation = questions[0].Description,
//                 TimeLimit = duration,
//                 Options = questions[0].Answers.Select((a, index) => new GameQuestionOption
//                 {
//                     Label = ((char)('A' + index)).ToString(),
//                     Content = a.Answer
//                 }).ToList(),
//                 RoomId = room.RoomId
//             };

//             using var scope = _serviceProvider.CreateScope();
//             var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<QuizHub>>();

//             // Game start sequence
//             await hubContext.Clients.Group(request.RoomId).SendAsync("gameStarting");
//             await Task.Delay(TimeSpan.FromSeconds(2));
//             await hubContext.Clients.Group(request.RoomId).SendAsync("gameStarted", new { room.RoomId, firstQuestion });
//             await Task.Delay(TimeSpan.FromSeconds(2));

//             // Start first question
//             await hubContext.Clients.Group(request.RoomId).SendAsync("questionStarting");
//             await Task.Delay(TimeSpan.FromSeconds(2));
//             await hubContext.Clients.Group(request.RoomId).SendAsync("questionStarted");

//             // Initialize and start timer
//             gameState.TimerCancellation = new CancellationTokenSource();
//             var timer = new System.Timers.Timer(5000); // Fire every 5 seconds
//             int time = (int)duration;

//             timer.Elapsed += async (sender, e) =>
//             {
//                 try
//                 {
//                     if (gameState.TimerCancellation.Token.IsCancellationRequested || gameState.IsPaused || gameState.IsEnded)
//                     {
//                         timer.Stop();
//                         timer.Dispose();
//                         return;
//                     }

//                     gameState.TimeRemaining = time;
//                     await hubContext.Clients.Group(request.RoomId).SendAsync("timerUpdate", new
//                     {
//                         RoomId = request.RoomId,
//                         TimeRemaining = time
//                     });

//                     if (time <= 0)
//                     {
//                         timer.Stop();
//                         timer.Dispose();
//                         if (!gameState.IsEnded)
//                         {
//                             await ProcessQuestionEnd(request.RoomId, hubContext, _quizService, isTimeUp: true);
//                         }
//                     }
//                     time -= 5; // Decrease by 5 seconds each tick
//                 }
//                 catch (Exception ex)
//                 {
//                     _logger.LogError(ex, "Error in timer tick for room {RoomId}", request.RoomId);
//                     timer.Stop();
//                     timer.Dispose();
//                 }
//             };

//             timer.Start();
//             _logger.LogInformation("Timer started for first question in room {RoomId}", request.RoomId);
//         }
//         catch (Exception ex)
//         {
//             _logger.LogError(ex, "Error starting game in room {RoomId}", request.RoomId);
//             using var scope = _serviceProvider.CreateScope();
//             var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<QuizHub>>();
//             await hubContext.Clients.Group(request.RoomId).SendAsync("error", new { Message = "Error starting game", Error = ex.Message });

//             if (_games.ContainsKey(request.RoomId))
//             {
//                 _games.Remove(request.RoomId);
//             }
//             throw;
//         }
//     }

//     public async Task SubmitAnswer(SubmitAnswerRequest request)
//     {
//         try
//         {
//             _logger.LogInformation("User {UserId} submitting answer for question {QuestionId} in room {RoomId}",
//                 request.UserId, request.QuestionId, request.RoomId);

//             if (!_rooms.TryGetValue(request.RoomId, out var room))
//             {
//                 _logger.LogWarning("Room {RoomId} not found", request.RoomId);
//                 throw new Exception("Room not found");
//             }

//             if (!_games.TryGetValue(request.RoomId, out var gameState))
//             {
//                 _logger.LogWarning("Game state for room {RoomId} not found", request.RoomId);
//                 throw new Exception("Game not found. The quiz may have ended.");
//             }

//             if (!gameState.IsStarted || gameState.IsEnded)
//             {
//                 _logger.LogWarning("SubmitAnswer rejected for room {RoomId}: Quiz has ended or is not active", request.RoomId);
//                 throw new Exception("Quiz has ended. Answers cannot be submitted.");
//             }

//             if (!room.PlayerList.Any(p => p.Id == request.UserId))
//             {
//                 _logger.LogWarning("User {UserId} not found in room {RoomId}", request.UserId, request.RoomId);
//                 throw new Exception("User not in room");
//             }

//             if (request.QuestionId != gameState.CurrentQuestionIndex + 1)
//             {
//                 _logger.LogWarning("Invalid QuestionId {QuestionId} for current question index {Index} in room {RoomId}",
//                     request.QuestionId, gameState.CurrentQuestionIndex, request.RoomId);
//                 throw new Exception("Invalid question ID");
//             }

//             string playerName;
//             lock (gameState)
//             {
//                 gameState.PlayerAnswers[request.UserId] = request.Answer;
//                 _logger.LogInformation("Stored answer for player {UserId}: [{Answers}]", request.UserId, string.Join(",", request.Answer));
//                 playerName = room.PlayerList.First(p => p.Id == request.UserId).Name;
//             }
            
//             // Tell other players that someone answered
//             await Clients.GroupExcept(request.RoomId, Context.ConnectionId).SendAsync("playerAnswered", new
//             {
//                 PlayerId = request.UserId,
//                 PlayerName = playerName
//             });

//             gameState.LastAnswerTime = DateTime.Now;
//             gameState.ShowRanking = true;

//             bool allAnswered = room.PlayerList.All(p => gameState.PlayerAnswers.ContainsKey(p.Id) || p.ConnectionId == null);
//             if (allAnswered)
//             {
//                 _logger.LogInformation("All players answered or disconnected in room {RoomId}, processing question end", request.RoomId);
//                 gameState.TimerCancellation?.Cancel();
//                 gameState.TimerCancellation?.Dispose();
//                 gameState.TimerCancellation = null;

//                 using var scope = _serviceProvider.CreateScope();
//                 var quizService = scope.ServiceProvider.GetRequiredService<IQuizzesService>();
//                 var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<QuizHub>>();
//                 await ProcessQuestionEnd(request.RoomId, hubContext, quizService, triggeredByUserId: request.UserId);
//             }
//         }
//         catch (Exception ex)
//         {
//             _logger.LogError(ex, "Error submitting answer for user {UserId} in room {RoomId}", request.UserId, request.RoomId);
//             await Clients.Group(request.RoomId).SendAsync("error", new { Message = "Error submitting answer", Error = ex.Message });
//             throw;
//         }
//     }

//     public async Task NextQuestion(NextQuestionRequest request)
//     {
//         try
//         {
//             _logger.LogInformation("Host {UserId} requesting next question for room {RoomId}", request.UserId, request.RoomId);

//             if (!_rooms.ContainsKey(request.RoomId) || !_games.ContainsKey(request.RoomId))
//             {
//                 _logger.LogWarning("Room or game not found for room {RoomId}", request.RoomId);
//                 throw new Exception("Room or game not found");
//             }

//             var room = _rooms[request.RoomId];
//             var gameState = _games[request.RoomId];

//             if (room.HostId != request.UserId)
//             {
//                 _logger.LogWarning("User {UserId} is not the host for room {RoomId}", request.UserId, request.RoomId);
//                 throw new Exception("Only the host can request the next question");
//             }

//             if (gameState.IsEnded)
//             {
//                 _logger.LogWarning("NextQuestion rejected for room {RoomId}: Quiz has ended", request.RoomId);
//                 throw new Exception("Quiz has ended. No more questions available.");
//             }

//             gameState.TimerCancellation?.Cancel();
//             gameState.TimerCancellation?.Dispose();
//             gameState.TimerCancellation = null;

//             using var scope = _serviceProvider.CreateScope();
//             var quizService = scope.ServiceProvider.GetRequiredService<IQuizzesService>();
//             var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<QuizHub>>();
//             await ProcessQuestionEnd(request.RoomId, hubContext, quizService, triggeredByUserId: request.UserId);
//         }
//         catch (Exception ex)
//         {
//             _logger.LogError(ex, "Error processing next question request for room {RoomId}", request.RoomId);
//             await Clients.Group(request.RoomId).SendAsync("error", new { Message = "Error processing next question", Error = ex.Message });
//             throw;
//         }
//     }

//     public async Task PauseTimer(PauseTimerRequest request)
//     {
//         try
//         {
//             _logger.LogInformation("Host {UserId} requesting to pause timer for room {RoomId}", request.UserId, request.RoomId);

//             if (!_rooms.ContainsKey(request.RoomId) || !_games.ContainsKey(request.RoomId))
//             {
//                 throw new Exception("Room or game not found");
//             }

//             var room = _rooms[request.RoomId];
//             if (room.HostId != request.UserId)
//             {
//                 throw new Exception("Only the host can pause the timer");
//             }

//             var gameState = _games[request.RoomId];
//             if (gameState.IsPaused)
//             {
//                 _logger.LogWarning("Timer already paused for room {RoomId}", request.RoomId);
//                 return;
//             }

//             if (gameState.QuestionStartTime == null || gameState.TimerCancellation == null)
//             {
//                 throw new Exception("No active question timer found");
//             }

//             var elapsed = (DateTime.Now - gameState.QuestionStartTime.Value).TotalSeconds;
//             gameState.TimeRemaining = Math.Max(0, gameState.OriginalDuration - elapsed);
//             gameState.IsPaused = true;

//             gameState.TimerCancellation?.Cancel();
//             gameState.TimerCancellation?.Dispose();
//             gameState.TimerCancellation = null;

//             _logger.LogInformation("Timer paused for room {RoomId}, timeRemaining: {TimeRemaining}s", request.RoomId, gameState.TimeRemaining);

//             await Clients.Group(request.RoomId).SendAsync("timerPaused", new
//             {
//                 RoomId = request.RoomId,
//                 TimeRemaining = gameState.TimeRemaining
//             });
//         }
//         catch (Exception ex)
//         {
//             _logger.LogError(ex, "Error pausing timer for room {RoomId}", request.RoomId);
//             await Clients.Group(request.RoomId).SendAsync("error", new { Message = "Error pausing timer", Error = ex.Message });
//             throw;
//         }
//     }

//     public async Task ResumeTimer(ResumeTimerRequest request)
//     {
//         try
//         {
//             _logger.LogInformation("Host {UserId} requesting to resume timer for room {RoomId}", request.UserId, request.RoomId);
//             await Clients.Group(request.RoomId).SendAsync("timerResuming");
//             await Task.Delay(TimeSpan.FromSeconds(1));

//             if (!_rooms.ContainsKey(request.RoomId) || !_games.ContainsKey(request.RoomId))
//             {
//                 throw new Exception("Room or game not found");
//             }

//             var room = _rooms[request.RoomId];
//             if (room.HostId != request.UserId)
//             {
//                 throw new Exception("Only the host can resume the timer");
//             }

//             var gameState = _games[request.RoomId];
//             if (!gameState.IsPaused)
//             {
//                 _logger.LogWarning("Timer not paused for room {RoomId}", request.RoomId);
//                 return;
//             }

//             gameState.QuestionStartTime = DateTime.Now;
//             gameState.IsPaused = false;

//             gameState.TimerCancellation = new CancellationTokenSource();

//             _ = Task.Run(() => StartQuestionTimer(request.RoomId, gameState.TimeRemaining, gameState), gameState.TimerCancellation.Token);

//             _logger.LogInformation("Timer resumed for room {RoomId}, timeRemaining: {TimeRemaining}s", request.RoomId, gameState.TimeRemaining);

//             await Clients.Group(request.RoomId).SendAsync("timerResumed", new
//             {
//                 RoomId = request.RoomId,
//                 TimeRemaining = gameState.TimeRemaining
//             });
//         }
//         catch (Exception ex)
//         {
//             _logger.LogError(ex, "Error resuming timer for room {RoomId}", request.RoomId);
//             await Clients.Group(request.RoomId).SendAsync("error", new { Message = "Error resuming timer", Error = ex.Message });
//             throw;
//         }
//     }

//     private async Task StartQuestionTimer(string roomId, double duration, GameState gameState)
//     {
//         try
//         {
//             using var scope = _serviceProvider.CreateScope();
//             var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<QuizHub>>();

//             _logger.LogInformation("Starting timer for room {RoomId}, duration: {Duration}s", roomId, duration);

//             gameState.QuestionStartTime = DateTime.Now;
//             gameState.TimeRemaining = duration;

//             for (int time = (int)duration; time >= 0 && !gameState.TimerCancellation.Token.IsCancellationRequested; time--)
//             {
//                 gameState.TimeRemaining = time;
//                 await hubContext.Clients.Group(roomId).SendAsync("timerUpdate", new
//                 {
//                     RoomId = roomId,
//                     TimeRemaining = time
//                 });
//                 if (time > 0)
//                 {
//                     await Task.Delay(1000, gameState.TimerCancellation.Token);
//                 }
//             }

//             if (!gameState.IsPaused && _games.ContainsKey(roomId) && !gameState.IsEnded)
//             {
//                 _logger.LogInformation("Timer expired for room {RoomId}", roomId);
//                 var quizService = scope.ServiceProvider.GetRequiredService<IQuizzesService>();
//                 await ProcessQuestionEnd(roomId, hubContext, quizService, isTimeUp: true);
//             }
//             else
//             {
//                 _logger.LogInformation("Timer stopped for room {RoomId}: IsPaused={IsPaused}, GameExists={GameExists}, IsEnded={IsEnded}",
//                     roomId, gameState.IsPaused, _games.ContainsKey(roomId), gameState.IsEnded);
//             }
//         }
//         catch (OperationCanceledException)
//         {
//             _logger.LogInformation("Timer cancelled for room {RoomId}", roomId);
//         }
//         catch (Exception ex)
//         {
//             _logger.LogError(ex, "Timer error for room {RoomId}", roomId);
//             try
//             {
//                 using var scope = _serviceProvider.CreateScope();
//                 var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<QuizHub>>();
//                 await hubContext.Clients.Group(roomId).SendAsync("error",
//                     new { Message = "Timer error", Error = ex.Message });
//             }
//             catch (Exception logEx)
//             {
//                 _logger.LogError(logEx, "Failed to send error for room {RoomId}", roomId);
//             }
//         }
//     }

//     private async Task ProcessQuestionEnd(string roomId, IHubContext<QuizHub> hubContext, IQuizzesService quizService, bool isTimeUp = false, int? triggeredByUserId = null)
//     {
//         try
//         {
//             _logger.LogInformation("Processing question end for room {RoomId}, isTimeUp: {IsTimeUp}, triggeredByUserId: {TriggeredByUserId}",
//                 roomId, isTimeUp, triggeredByUserId);

//             if (!_games.TryGetValue(roomId, out var gameState) || !_rooms.TryGetValue(roomId, out var room))
//             {
//                 _logger.LogWarning("Room or game state not found for room {RoomId}", roomId);
//                 return;
//             }

//             gameState.TimerCancellation?.Cancel();
//             gameState.TimerCancellation?.Dispose();
//             gameState.TimerCancellation = null;

//             var quiz = await quizService.GetQuizByIdAsync(room.QuizId);
//             if (quiz?.Questions == null || !quiz.Questions.Any())
//             {
//                 _logger.LogWarning("Quiz or questions not found for room {RoomId}", roomId);
//                 throw new Exception("Quiz or questions not found");
//             }
//             var questions = quiz.Questions.ToList();
//             if (gameState.CurrentQuestionIndex < 0 || gameState.CurrentQuestionIndex >= questions.Count)
//             {
//                 _logger.LogWarning("Invalid question index {Index} for room {RoomId}", gameState.CurrentQuestionIndex, roomId);
//                 throw new Exception("Invalid question index");
//             }
//             var currentQuestion = questions[gameState.CurrentQuestionIndex];

//             var correctAnswers = currentQuestion.Answers
//                 .Select((a, index) => new { Answer = a, Label = ((char)('A' + index)).ToString() })
//                 .Where(x => x.Answer.IsCorrect)
//                 .Select(x => x.Label)
//                 .ToList();

//             // Calculate scores
//             foreach (var player in room.PlayerList)
//             {
//                 var currentScore = gameState.PlayerScores.GetValueOrDefault(player.Id, 0);
//                 if (gameState.PlayerAnswers.TryGetValue(player.Id, out var playerAnswer))
//                 {
//                     _logger.LogInformation("Player {PlayerId} answered: [{Answers}], Correct: [{Correct}]",
//                         player.Id, string.Join(",", playerAnswer), string.Join(",", correctAnswers));

//                     var isCorrect = playerAnswer != null &&
//                                     playerAnswer.Count > 0 &&
//                                     playerAnswer.All(a => correctAnswers.Contains(a)) &&
//                                     playerAnswer.Count == correctAnswers.Count;

//                     if (isCorrect)
//                     {
//                         currentScore += currentQuestion.Score;
//                         _logger.LogInformation("Player {PlayerId} scored {Score} points for question {QuestionId}",
//                             player.Id, currentQuestion.Score, currentQuestion.Id);
//                     }
//                     else
//                     {
//                         _logger.LogInformation("Player {PlayerId} did not score for question {QuestionId}",
//                             player.Id, currentQuestion.Id);
//                     }
//                 }
//                 else
//                 {
//                     _logger.LogInformation("Player {PlayerId} did not submit an answer for question {QuestionId}",
//                         player.Id, currentQuestion.Id);
//                 }

//                 gameState.PlayerScores[player.Id] = currentScore;
//                 player.Score = currentScore;
//             }

//             // Save answers before clearing
//             var playerAnswers = new Dictionary<int, List<string>>(gameState.PlayerAnswers);

//             // Send results
//             await hubContext.Clients.Group(roomId).SendAsync("showingResult", new
//             {
//                 QuestionId = currentQuestion.Id,
//                 TrueAnswer = correctAnswers,
//                 YourAnswer = playerAnswers,
//                 Duration = 500
//             });

//             gameState.PlayerAnswers.Clear();
//             await Task.Delay(TimeSpan.FromMilliseconds(500));

//             var playerScores = room.PlayerList.Select(p => new PlayerScore
//             {
//                 UserId = p.Id,
//                 Name = p.Name,
//                 Score = gameState.PlayerScores.GetValueOrDefault(p.Id, 0)
//             }).ToList();

//             // Always show ranking after scores are calculated
//             await hubContext.Clients.Group(roomId).SendAsync("showingRanking");
//             await Task.Delay(TimeSpan.FromSeconds(1));
//             await hubContext.Clients.Group(roomId).SendAsync("updateRanking", playerScores);
//             await Task.Delay(TimeSpan.FromSeconds(1));

//             GameQuestionResponse nextQuestion = null;
//             bool hasNextQuestion = gameState.CurrentQuestionIndex < questions.Count - 1;

//             if (hasNextQuestion)
//             {
//                 var next = questions[gameState.CurrentQuestionIndex + 1];
//                 var nextDuration = 30; // Hardcoded for testing
//                 nextQuestion = new GameQuestionResponse
//                 {
//                     Id = next.Id,
//                     Name = next.Name,
//                     Explanation = next.Description,
//                     TimeLimit = nextDuration,
//                     Options = next.Answers.Select((a, index) => new GameQuestionOption
//                     {
//                         Label = ((char)('A' + index)).ToString(),
//                         Content = a.Answer
//                     }).ToList(),
//                     RoomId = room.RoomId
//                 };
//                 gameState.CurrentQuestionIndex++;
//                 gameState.OriginalDuration = nextDuration;
//                 gameState.TimeRemaining = nextDuration;
//                 gameState.IsPaused = false;
//                 gameState.ShowRanking = false; // Reset for next question
//             }

//             var result = new QuestionResultResponse
//             {
//                 RoomId = roomId,
//                 QuizId = room.QuizId,
//                 QuestionId = currentQuestion.Id,
//                 TrueAnswer = correctAnswers,
//                 Ranking = playerScores,
//                 NextQuestion = nextQuestion,
//                 IsLastQuestion = !hasNextQuestion
//             };

//             _logger.LogInformation("Sending doneQuestion event for room {RoomId}, question {QuestionId}, nextQuestionId: {NextQuestionId}",
//                 roomId, currentQuestion.Id, nextQuestion?.Id);
//             await hubContext.Clients.Group(roomId).SendAsync("doneQuestion", result);

//             if (hasNextQuestion)
//             {
//                 // Set up and start timer for next question
//                 gameState.TimerCancellation = new CancellationTokenSource();
//                 var timer = new System.Timers.Timer(5000); // Fire every 5 seconds
//                 int time = (int)nextQuestion.TimeLimit;

//                 timer.Elapsed += async (sender, e) =>
//                 {
//                     try
//                     {
//                         if (gameState.TimerCancellation.Token.IsCancellationRequested || gameState.IsPaused || gameState.IsEnded)
//                         {
//                             timer.Stop();
//                             timer.Dispose();
//                             return;
//                         }

//                         gameState.TimeRemaining = time;
//                         await hubContext.Clients.Group(roomId).SendAsync("timerUpdate", new
//                         {
//                             RoomId = roomId,
//                             TimeRemaining = time
//                         });

//                         if (time <= 0)
//                         {
//                             timer.Stop();
//                             timer.Dispose();
//                             if (!gameState.IsEnded)
//                             {
//                                 await ProcessQuestionEnd(roomId, hubContext, quizService, isTimeUp: true);
//                             }
//                         }
//                         time -= 5; // Decrease by 5 seconds each tick
//                     }
//                     catch (Exception ex)
//                     {
//                         _logger.LogError(ex, "Error in timer tick for room {RoomId}", roomId);
//                         timer.Stop();
//                         timer.Dispose();
//                     }
//                 };

//                 timer.Start();
//                 _logger.LogInformation("Timer started for next question in room {RoomId}", roomId);
//             }
//             else
//             {
//                 var quizResult = new QuizResultResponse
//                 {
//                     RoomId = roomId,
//                     QuizId = room.QuizId,
//                     Ranking = playerScores
//                 };

//                 _logger.LogInformation("Sending doneQuiz event for room {RoomId}", roomId);
//                 await hubContext.Clients.Group(roomId).SendAsync("doneQuiz", quizResult);

//                 gameState.IsEnded = true;

//                 await Task.Delay(TimeSpan.FromSeconds(5));
//                 _games.Remove(roomId);
//                 _logger.LogInformation("Game ended for room {RoomId}, all questions completed", roomId);
//                 return;
//             }

//             await hubContext.Clients.Group(roomId).SendAsync("questionStarting");
//             await Task.Delay(TimeSpan.FromSeconds(2));
//             await hubContext.Clients.Group(roomId).SendAsync("questionStarted");

//             gameState.TimerCancellation = new CancellationTokenSource();
//             _ = Task.Run(() => StartQuestionTimer(roomId, gameState.TimeRemaining, gameState), gameState.TimerCancellation.Token);
//         }
//         catch (Exception ex)
//         {
//             _logger.LogError(ex, "Error processing question end for room {RoomId}", roomId);
//             await hubContext.Clients.Group(roomId).SendAsync("error", new { Message = "Error processing question end", Error = ex.Message });
//             throw;
//         }
//     }
// }