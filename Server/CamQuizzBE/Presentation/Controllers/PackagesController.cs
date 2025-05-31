using CamQuizzBE.Applications.DTOs.Packages;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Presentation.Utils;

namespace CamQuizzBE.Presentation.Controllers
{
    [Route("api/v1/packages")]
    [ApiController]
    public class PackagesController(IPackagesRepository packagesRepository, IMapper mapper) : ControllerBase
    {
        private readonly IPackagesRepository _packagesRepository = packagesRepository;
        private readonly IMapper _mapper = mapper;

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<PackageDto>>>> GetAllPackages()
        {
            var packages = await _packagesRepository.GetAllAsync();
            return Ok(new ApiResponse<IEnumerable<PackageDto>>(packages));
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreatePackage([FromBody] CreatePackageDto packageDto)
        {
            var package = await _packagesRepository.AddAsync(new Packages
            {
                Name = packageDto.Name,
                Price = packageDto.Price,
                EndDate = packageDto.EndDate,
                StartDate = packageDto.StartDate,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            });

            return Ok(new ApiResponse<PackageDto>(_mapper.Map<PackageDto>(package)));

        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeletePackage(int id)
        {
            await _packagesRepository.DeleteAsync(id);
            return Ok(new ApiResponse<string>("Package deleted successfully"));
        }

        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpdatePackage([FromBody] UpdatePackageDto updatePackageDto)
        {
            var existing = await _packagesRepository.GetByIdAsync(updatePackageDto.Id);
            if (existing == null)
            {
                return NotFound(new ApiResponse<string>("Package not found", "error"));
            }

            var package = new Packages
            {
                Id = updatePackageDto.Id,
                Name = updatePackageDto.Name ?? existing.Name,
                Price = updatePackageDto.Price ?? existing.Price,
                StartDate = updatePackageDto.StartDate ?? existing.StartDate,
                EndDate = updatePackageDto.EndDate ?? existing.EndDate,
                CreatedAt = existing.CreatedAt
            };

            await _packagesRepository.UpdateAsync(package);
            return Ok(new ApiResponse<PackageDto>(_mapper.Map<PackageDto>(package)));
        }
    }
}
