namespace CamQuizzBE.Applications.DTOs.Quizzes;

public class UpdateQuestionDto
{   
    [Required]
    public int QuestionId {get;set;} 

    [MinLength(3, ErrorMessage = "Name must be at least 3 characters long.")]
    [MaxLength(100, ErrorMessage = "Name must not exceed 100 characters.")]
    public string Name { get; set; } = string.Empty;

    [MinLength(10, ErrorMessage = "Description must be at least 10 characters long.")]
    [MaxLength(500, ErrorMessage = "Description must not exceed 500 characters.")]
    public string Description { get; set; } = string.Empty;
    public int? Duration { get; set; } = 0;
    public int? Score { get; set; }

}
