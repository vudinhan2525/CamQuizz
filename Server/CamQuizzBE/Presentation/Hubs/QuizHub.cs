using Microsoft.AspNetCore.SignalR;
using CamQuizzBE.Applications.DTOs.Quizzes;
using CamQuizzBE.Applications.DTOs.Questions;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Infras.Data;

namespace CamQuizzBE.Presentation.Hubs;

public class GameState
{
    public bool IsStarted { get; set; }
    public int CurrentQuestionIndex { get; set; } = -1;
    public Dictionary<int, List<string>> PlayerAnswers { get; set; } = new();
    public Dictionary<int, int> PlayerScores { get; set; } = new();
    public System.Timers.Timer? QuestionTimer { get; set; }
}

public class QuizHub : Hub
{
    private static readonly Dictionary<string, RoomDto> _rooms = new();
    private static readonly Dictionary<string, GameState> _games = new();
    private readonly ILogger<QuizHub> _logger;
    private readonly IUserService _userService;
    private readonly IQuizzesService _quizService;
    private readonly DataContext _context;

    public QuizHub(
        ILogger<QuizHub> logger,
        IUserService userService,
        IQuizzesService quizService,
        DataContext context)
    {
        _logger = logger;
        _userService = userService;
        _quizService = quizService;
        _context = context;
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("Client Connected: {ConnectionId}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client Disconnected: {ConnectionId}, Error: {Error}", 
            Context.ConnectionId, exception?.Message ?? "None");

        foreach (var room in _rooms.Values)
        {
            var player = room.PlayerList.FirstOrDefault(p => p.ConnectionId == Context.ConnectionId);
            if (player != null)
            {
                await LeaveRoom(new LeaveRoomRequest { RoomId = room.RoomId, UserId = player.Id });
            }
        }

        await base.OnDisconnectedAsync(exception);
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
            if (quiz?.Questions == null)
            {
                throw new Exception("Quiz or questions not found");
            }
            var questions = quiz.Questions.ToList();

            if (!questions.Any())
            {
                throw new Exception("No questions found for this quiz");
            }

            var gameState = new GameState
            {
                IsStarted = true,
                CurrentQuestionIndex = 0
            };

            var firstQuestion = new GameQuestionResponse
            {
                Id = questions[0].Id,
                Content = questions[0].Description,
                TimeLimit = quiz.Duration > 0 ? quiz.Duration : 60,
                Options = questions[0].Answers.Select((a, index) => new GameQuestionOption 
                { 
                    Label = ((char)('A' + index)).ToString(), 
                    Content = a.Answer 
                }).ToList()
            };

            _games[request.RoomId] = gameState;

            var duration = quiz.Duration > 0 ? quiz.Duration : 60;
            gameState.QuestionTimer = new System.Timers.Timer(duration * 1000);
            gameState.QuestionTimer.Elapsed += async (sender, e) => await OnQuestionTimeUp(request.RoomId);
            gameState.QuestionTimer.AutoReset = false;
            gameState.QuestionTimer.Start();

            await Clients.Group(request.RoomId).SendAsync("gameStarted", new { room.RoomId, firstQuestion });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting game in room {RoomId}", request.RoomId);
            throw;
        }
    }

    public async Task SubmitAnswer(SubmitAnswerRequest request)
    {
        try
        {
            _logger.LogInformation("User {UserId} submitting answer for question {QuestionId}", request.UserId, request.QuestionId);

            if (!_rooms.ContainsKey(request.RoomId) || !_games.ContainsKey(request.RoomId))
            {
                throw new Exception("Room or game not found");
            }

            var gameState = _games[request.RoomId];
            var room = _rooms[request.RoomId];

            gameState.PlayerAnswers[request.UserId] = request.Answer;

            bool allAnswered = room.PlayerList.All(p => gameState.PlayerAnswers.ContainsKey(p.Id));
            if (allAnswered)
            {
                await ProcessQuestionEnd(request.RoomId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting answer");
            throw;
        }
    }

    private async Task OnQuestionTimeUp(string roomId)
    {
        await ProcessQuestionEnd(roomId);
    }

    private async Task ProcessQuestionEnd(string roomId)
    {
        try
        {
            var gameState = _games[roomId];
            var room = _rooms[roomId];

            gameState.QuestionTimer?.Stop();

            var quiz = await _quizService.GetQuizByIdAsync(room.QuizId);
            if (quiz?.Questions == null)
            {
                throw new Exception("Quiz or questions not found");
            }
            var questions = quiz.Questions.ToList();
            var currentQuestion = questions[gameState.CurrentQuestionIndex];

            var correctAnswers = currentQuestion.Answers
                .Select((a, index) => new { Answer = a, Label = ((char)('A' + index)).ToString() })
                .Where(x => x.Answer.IsCorrect)
                .Select(x => x.Label)
                .ToList();

            foreach (var playerId in gameState.PlayerAnswers.Keys)
            {
                var playerAnswer = gameState.PlayerAnswers[playerId];
                var score = gameState.PlayerScores.GetValueOrDefault(playerId, 0);
                
                if (playerAnswer.Count == correctAnswers.Count && 
                    playerAnswer.All(answer => correctAnswers.Contains(answer)))
                {
                    score += currentQuestion.Score;
                    gameState.PlayerScores[playerId] = score;

                    var player = room.PlayerList.First(p => p.Id == playerId);
                    player.Score = score;
                }
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
                    TimeLimit = quiz.Duration > 0 ? quiz.Duration : 30,
                    Options = next.Answers.Select((a, index) => new GameQuestionOption 
                    { 
                        Label = ((char)('A' + index)).ToString(), 
                        Content = a.Answer 
                    }).ToList()
                };
                gameState.CurrentQuestionIndex++;

                var nextDuration = quiz.Duration > 0 ? quiz.Duration : 30;
                gameState.QuestionTimer = new System.Timers.Timer(nextDuration * 1000);
                gameState.QuestionTimer.Elapsed += async (sender, e) => await OnQuestionTimeUp(roomId);
                gameState.QuestionTimer.AutoReset = false;
                gameState.QuestionTimer.Start();
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

            await Clients.Group(roomId).SendAsync("doneQuestion", result);

            if (nextQuestion == null)
            {
                _games.Remove(roomId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing question end for room {RoomId}", roomId);
            throw;
        }
    }
}
