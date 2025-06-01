using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Applications.DTOs.Packages;

namespace CamQuizzBE.Domain.Interfaces
{
    public interface IPackagesRepository
    {
        Task<IEnumerable<PackageDto>> GetAllAsync();
        Task<PackageDto?> GetByIdAsync(int id);
        Task<Packages> AddAsync(Packages package);
        Task UpdateAsync(Packages package);
        Task DeleteAsync(int id);
        Task<IEnumerable<UserPackages>> GetAllUserPackagesAsync(int userId);
        Task<UserPackages> AddUserPackageAsync(UserPackages userPackage);

        Task<RevenueStatsDto> GetRevenueStatisticsAsync(int year);
        Task<RevenueRecords> AddRevenueRecordAsync(RevenueRecords revenueRecord);
    }
}
