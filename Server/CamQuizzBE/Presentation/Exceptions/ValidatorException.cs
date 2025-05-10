namespace CamQuizzBE.Presentation.Exceptions;
public class ValidatorException : Exception
{
    public List<string> Errors { get; }

    public ValidatorException(string message) : base(message)
    {
        Errors = new List<string> { message };
    }

    public ValidatorException(List<string> errors) : base("Validation error")
    {
        Errors = errors;
    }
}
