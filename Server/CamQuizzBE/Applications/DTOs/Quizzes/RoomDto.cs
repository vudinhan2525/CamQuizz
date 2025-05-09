using System;
using System.Collections.Generic;

namespace CamQuizzBE.Applications.DTOs.Quizzes
{
    public class PlayerDto
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Avatar { get; set; }
        public int Score { get; set; }
        public required string ConnectionId { get; set; }
    }

    public class RoomDto
    {
        public required string RoomId { get; set; }
        public int QuizId { get; set; }
        public int HostId { get; set; }
        public List<PlayerDto> PlayerList { get; set; } = new List<PlayerDto>();
    }

    public class CreateRoomRequest
    {
        public int QuizId { get; set; }
        public int UserId { get; set; }
    }

    public class JoinRoomRequest 
    {
        public required string RoomId { get; set; }
        public int UserId { get; set; }
    }

    public class LeaveRoomRequest
    {
        public required string RoomId { get; set; }
        public int UserId { get; set; }
    }
}