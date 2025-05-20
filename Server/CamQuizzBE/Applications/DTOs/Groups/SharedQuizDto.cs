using System;
using CamQuizzBE.Domain.Enums;

namespace CamQuizzBE.Applications.DTOs.Groups;

public class SharedQuizDto
{
    public int QuizId { get; set; }
    public string QuizName { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public int Duration { get; set; }
    public int NumberOfQuestions { get; set; }
    public int SharedById { get; set; }
    public string SharedByName { get; set; } = string.Empty;
    public DateTime SharedAt { get; set; }
    public QuizStatus Status { get; set; }
}