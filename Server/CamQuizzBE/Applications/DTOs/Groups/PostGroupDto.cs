using CamQuizzBE.Domain.Entities;
public class CreateGroupDto
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public int OwnerId { get; set; }
}
