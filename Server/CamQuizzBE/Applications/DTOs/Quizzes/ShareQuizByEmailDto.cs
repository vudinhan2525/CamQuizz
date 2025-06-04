using System.ComponentModel.DataAnnotations;

namespace CamQuizzBE.Applications.DTOs.Quizzes
{
    public class ShareQuizByEmailDto
    {
        [Required]
        public int QuizId { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public int OwnerId { get; set; }
    }

    public class ShareQuizByEmailResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}