namespace CamQuizzBE.Domain.Interfaces;

using CamQuizzBE.Domain.Enums;
using System.Threading.Tasks;

public interface IGroupService
{
    Task UpdateGroupStatusAsync(int groupId, GroupStatus newStatus);
    // Add other methods as needed
}