using System.ComponentModel.DataAnnotations;

namespace CamQuizzBE.Applications.DTOs.Groups;

public class ShareQuizDto
{
    [Required]
    public int QuizId { get; set; }

    [Required]
    public int GroupId { get; set; }
}