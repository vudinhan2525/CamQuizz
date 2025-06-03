using System.Collections.Generic;

namespace CamQuizzBE.Applications.DTOs.Reports;

public class QuizPlayReportDto
{
    public int TotalPlayers { get; set; }
    public double AverageScore { get; set; }
    public Dictionary<string, int> ScoreDistribution { get; set; } = new();
    public List<QuizPlayQuestionStatsDto> QuestionStats { get; set; } = new();
}

public class QuizPlayQuestionStatsDto
{
    public int QuestionId { get; set; }
    public string QuestionName { get; set; }
    public double AverageAnswerTime { get; set; }
    public int CorrectAnswers { get; set; }
    public int TotalAnswers { get; set; }
    public double CorrectRate { get; set; }
    public List<QuizPlayOptionStatsDto> OptionStats { get; set; } = new();
}

public class QuizPlayOptionStatsDto
{
    public int AnswerId { get; set; }
    public string AnswerText { get; set; }
    public double SelectionRate { get; set; }
}