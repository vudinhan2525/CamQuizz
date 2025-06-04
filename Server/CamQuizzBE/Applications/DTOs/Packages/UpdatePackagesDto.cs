public class UpdatePackageDto
{
    public required int Id { get; set; }
    public string? Name { get; set; }
    public int? Price { get; set; }
    public int? MaxNumberOfQuizz { get; set; }
    public int? MaxNumberOfAttended { get; set; }
}