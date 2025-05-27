using System.ComponentModel.DataAnnotations;

namespace CamQuizzBE.Applications.DTOs.Groups;

/// <summary>
/// DTO for sharing a quiz with a group
/// </summary>
public class ShareQuizDto
{
    /// <summary>
    /// The ID of the quiz to share
    /// </summary>
    [Required(ErrorMessage = "Quiz ID is required")]
    [Range(1, int.MaxValue, ErrorMessage = "Quiz ID must be greater than 0")]
    public int QuizId { get; set; }
}