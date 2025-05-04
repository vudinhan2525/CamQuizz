using CamQuizzBE.Domain.Entities;
public class CreateGroupDto
{
    public string Name { get; set; }
    public string Description { get; set; }
    public int OwnerId { get; set; }
}
