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
            existing.StartDate = package.StartDate;
            existing.EndDate = package.EndDate;
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

        public async Task<IEnumerable<UserPackages>> GetAllUserPackagesAsync()
        {
            return await _context.UserPackages
                .Include(up => up.Package)
                .Include(up => up.User)
                .ToListAsync();
        }

        public async Task AddAsync(UserPackages userPackage)
        {
            _context.UserPackages.Add(userPackage);
            await _context.SaveChangesAsync();
        }
    }
}
