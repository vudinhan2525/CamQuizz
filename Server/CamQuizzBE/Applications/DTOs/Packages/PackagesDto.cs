namespace CamQuizzBE.Applications.DTOs.Packages
{
    public class PackageDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Price { get; set; }
        public int MaxNumberOfQuizz { get; set; }
        public int MaxNumberOfAttended { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
