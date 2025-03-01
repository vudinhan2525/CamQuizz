namespace CamQuizzBE.Applications.Helpers;

public class UserParams : PaginationParams
{
    public string? Gender { get; set; }
    public string? CurrentEmail { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? OrderBy { get; set; } = "email";
    public string? SortBy { get; set; } = "asc";
}
