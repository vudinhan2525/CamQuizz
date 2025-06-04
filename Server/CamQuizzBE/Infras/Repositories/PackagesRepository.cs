using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Applications.DTOs.Packages;
using CamQuizzBE.Infras.Data;

namespace CamQuizzBE.Infras.Repositories
{
    public class PackagesRepository : IPackagesRepository
    {
        private readonly DataContext _context;

        public PackagesRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PackageDto>> GetAllAsync()
        {
            return await _context.Packages
                .Select(p => new PackageDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    StartDate = p.StartDate,
                    MaxNumberOfAttended = p.MaxNumberOfAttended,
                    MaxNumberOfQuizz = p.MaxNumberOfQuizz,
                    EndDate = p.EndDate,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt
                })
                .ToListAsync();
        }

        public async Task<PackageDto?> GetByIdAsync(int id)
        {
            return await _context.Packages
                .Where(p => p.Id == id)
                .Select(p => new PackageDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<Packages> AddAsync(Packages package)
        {
            _context.Packages.Add(package);
            await _context.SaveChangesAsync();
            return package;
        }

        public async Task UpdateAsync(Packages package)
        {
            var existing = await _context.Packages.FindAsync(package.Id);
            if (existing == null)
                throw new KeyNotFoundException("Package not found.");

            existing.Name = package.Name;
            existing.Price = package.Price;
            // existing.StartDate = package.StartDate;
            // existing.EndDate = package.EndDate;
            existing.MaxNumberOfQuizz = package.MaxNumberOfQuizz; 
            existing.MaxNumberOfAttended = package.MaxNumberOfAttended; 
            existing.UpdatedAt = DateTime.UtcNow;

            _context.Packages.Update(existing);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var package = await _context.Packages.FindAsync(id);
            if (package != null)
            {
                _context.Packages.Remove(package);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<UserPackages>> GetAllUserPackagesAsync(int userId)
        {
            return await _context.UserPackages
                .Where(up => up.UserId == userId)
                .Include(up => up.Package)
                .Include(up => up.User)
                .ToListAsync();
        }

        public async Task<UserPackages> AddUserPackageAsync(UserPackages userPackage)
        {
            _context.UserPackages.Add(userPackage);
            await _context.SaveChangesAsync();
            return userPackage;
        }
        public async Task<RevenueRecords> AddRevenueRecordAsync(RevenueRecords revenueRecord)
        {
            _context.RevenueRecords.Add(revenueRecord);
            await _context.SaveChangesAsync();
            return revenueRecord;
        }
        public async Task<RevenueStatsDto> GetRevenueStatisticsAsync(int year)
        {

            var allRecords = await _context.RevenueRecords
                .Include(r => r.Package)
                .Where(r => r.Date.Year == year)
                .ToListAsync();

            var monthlyRevenue = Enumerable.Range(1, 12)
                .Select(month => new MonthlyRevenueDto
                {
                    Month = month,
                    Revenue = allRecords
                        .Where(r => r.Date.Month == month)
                        .Sum(r => r.Amount)
                }).ToList();


            var groupedByPackage = allRecords
                .GroupBy(r => new { r.PackageId, r.Package.Name })
                .Select(g => new PackageSalesDto
                {
                    PackageId = g.Key.PackageId,
                    PackageName = g.Key.Name,
                    SoldCount = g.Count()
                }).ToList();

            return new RevenueStatsDto
            {
                MonthlyRevenue = monthlyRevenue,
                TotalRevenue = allRecords.Sum(r => r.Amount),
                TotalSoldPackages = allRecords.Count,
                PackageSales = groupedByPackage
            };
        }
    }
}
