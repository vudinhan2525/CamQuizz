using CamQuizzBE.Applications.DTOs.Packages;
using CamQuizzBE.Domain.Entities;
using CamQuizzBE.Domain.Interfaces;
using CamQuizzBE.Presentation.Exceptions;
using CamQuizzBE.Presentation.Utils;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace CamQuizzBE.Presentation.Controllers
{
    [Route("api/v1/packages")]
    [ApiController]
    public class PackagesController(IPackagesRepository packagesRepository, IConfiguration config, ILogger<PackagesController> logger, IUserRepository userRepository, IMapper mapper) : ControllerBase
    {
        private readonly IPackagesRepository _packagesRepository = packagesRepository;
        private readonly IUserRepository _userRepository = userRepository;
        private readonly ILogger<PackagesController> _logger = logger;
        private readonly IMapper _mapper = mapper;
        private readonly IConfiguration _config = config;

        [HttpPost("get-qr")]
        [Authorize]
        public async Task<IActionResult> GetQR([FromBody] GenQRDto genQRDto)
        {
            var package = await _packagesRepository.GetByIdAsync(genQRDto.PackageId);
            if (package == null)
            {
                return NotFound($"Package with ID {genQRDto.PackageId} was not found.");
            }
            var partnerCode = "MOMO";
            var accessKey = _config["MOMO_ACCESS_KEY"];
            var secretKey = _config["MOMO_SECRET_KEY"];

            var requestId = partnerCode + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var orderId = requestId;
            var orderInfo = "pay with MoMo";
            var redirectUrl = _config["FE_URL"];
            var ipnUrl = _config["NGROK_SERVER"] + "/api/v1/packages/successMomo";
            var amount = package.Price;
            var requestType = "captureWallet";

            var jsonExtraData = JsonSerializer.Serialize(genQRDto);
            var extraData = Convert.ToBase64String(Encoding.UTF8.GetBytes(jsonExtraData));

            var rawSignature = $"accessKey={accessKey}&amount={amount}&extraData={extraData}&ipnUrl={ipnUrl}&orderId={orderId}&orderInfo={orderInfo}&partnerCode={partnerCode}&redirectUrl={redirectUrl}&requestId={requestId}&requestType={requestType}";

            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey));
            var signatureBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawSignature));
            var signature = BitConverter.ToString(signatureBytes).Replace("-", "").ToLower();

            var requestBody = new
            {
                partnerCode,
                accessKey,
                requestId,
                amount,
                orderId,
                orderInfo,
                redirectUrl,
                ipnUrl,
                extraData,
                requestType,
                signature,
                lang = "vi"
            };

            using var httpClient = new HttpClient();
            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

            var response = await httpClient.PostAsync("https://test-payment.momo.vn/v2/gateway/api/create", content);
            var responseBody = await response.Content.ReadAsStringAsync();

            var result = JsonSerializer.Deserialize<JsonElement>(responseBody);

            return Ok(new ApiResponse<JsonElement>(result));
        }

        [HttpPost("successMomo")]
        public async Task<IActionResult> ReceiveMomoWebhook([FromBody] JsonElement momoData)
        {
            _logger.LogInformation("MoMo IPN Received:");
            _logger.LogInformation(JsonSerializer.Serialize(momoData, new JsonSerializerOptions { WriteIndented = true }));

            string partnerCode = momoData.GetProperty("partnerCode").GetString();
            string orderId = momoData.GetProperty("orderId").GetString();
            string requestId = momoData.GetProperty("requestId").GetString();
            int amount = momoData.GetProperty("amount").GetInt32();
            string orderInfo = momoData.GetProperty("orderInfo").GetString();
            string orderType = momoData.GetProperty("orderType").GetString();
            long transId = momoData.GetProperty("transId").GetInt64();
            int resultCode = momoData.GetProperty("resultCode").GetInt32();
            string message = momoData.GetProperty("message").GetString();
            string payType = momoData.GetProperty("payType").GetString();
            long responseTime = momoData.GetProperty("responseTime").GetInt64();
            string extraDataBase64 = momoData.GetProperty("extraData").GetString();
            string momoSignature = momoData.GetProperty("signature").GetString(); ;

            var accessKey = _config["MOMO_ACCESS_KEY"];
            var secretKey = _config["MOMO_SECRET_KEY"];

            string rawSignature =
                $"accessKey={accessKey}&" +
                $"amount={amount}&" +
                $"extraData={extraDataBase64}&" +
                $"message={message}&" +
                $"orderId={orderId}&" +
                $"orderInfo={orderInfo}&" +
                $"orderType={orderType}&" +
                $"partnerCode={partnerCode}&" +
                $"payType={payType}&" +
                $"requestId={requestId}&" +
                $"responseTime={responseTime}&" +
                $"resultCode={resultCode}&" +
                $"transId={transId}";

            using var hmac = new System.Security.Cryptography.HMACSHA256(Encoding.UTF8.GetBytes(secretKey));
            var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawSignature));
            var computedSignature = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();

            if (computedSignature != momoSignature)
            {
                _logger.LogWarning("Invalid MoMo Signature! Possible spoofing attempt.");
                return BadRequest(new { message = "Invalid signature" });
            }

            var decodedJson = Encoding.UTF8.GetString(Convert.FromBase64String(extraDataBase64));
            var extraData = JsonSerializer.Deserialize<GenQRDto>(decodedJson);

            _logger.LogInformation("Decoded extraData:");
            _logger.LogInformation(decodedJson);

            if (resultCode == 0)
            {
                _logger.LogInformation($"✅ Payment success for Order ID: {orderId}, Transaction ID: {transId}");
                var package = await _packagesRepository.GetByIdAsync(extraData.PackageId);

                if (package == null)
                {
                    throw new NotFoundException("Package not found");
                }
                await _packagesRepository.AddUserPackageAsync(new UserPackages
                {
                    UserId = extraData.UserId,
                    PackageId = package.Id,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                });


                await _packagesRepository.AddRevenueRecordAsync(new RevenueRecords
                {
                    Amount = package.Price,
                    PackageId = package.Id,
                    UserId = extraData.UserId,
                    Date = DateTime.Now,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                });
            }
            else
            {
                _logger.LogInformation($"❌ Payment failed for Order ID: {orderId}, Message: {message}");
            }

            return Ok(new { message = "Received and verified MoMo IPN" });
        }

        [HttpGet("stats/{year}")]
        public async Task<IActionResult> GetRevenueStats(int year)
        {
            var stats = await _packagesRepository.GetRevenueStatisticsAsync(year);
            return Ok(stats);
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<PackageDto>>>> GetAllPackages()
        {
            var packages = await _packagesRepository.GetAllAsync();
            return Ok(new ApiResponse<IEnumerable<PackageDto>>(packages));
        }

        [HttpGet("user/{id}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<UserPackagesDto>>>> GetAllUserPackages(int id)
        {
            var packages = await _packagesRepository.GetAllUserPackagesAsync(id);
            return Ok(new ApiResponse<IEnumerable<UserPackagesDto>>(_mapper.Map<IEnumerable<UserPackagesDto>>(packages)));
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreatePackage([FromBody] CreatePackageDto packageDto)
        {
            _logger.LogInformation("----------");
            _logger.LogInformation(packageDto.MaxNumberOfAttended.ToString());
            _logger.LogInformation(packageDto.MaxNumberOfQuizz.ToString());
            var package = await _packagesRepository.AddAsync(new Packages
            {
                Name = packageDto.Name,
                Price = packageDto.Price,
                EndDate = packageDto.EndDate,
                StartDate = packageDto.StartDate,
                MaxNumberOfAttended = packageDto.MaxNumberOfAttended,
                MaxNumberOfQuizz = packageDto.MaxNumberOfQuizz,
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
                MaxNumberOfAttended = updatePackageDto.MaxNumberOfAttended ?? existing.MaxNumberOfAttended,
                MaxNumberOfQuizz = updatePackageDto.MaxNumberOfQuizz ?? existing.MaxNumberOfQuizz,
                CreatedAt = existing.CreatedAt
            };

            await _packagesRepository.UpdateAsync(package);
            return Ok(new ApiResponse<PackageDto>(_mapper.Map<PackageDto>(package)));
        }
        //Total Quizz + Totel Participants for each package
        //Field: remainingQuizz, totalQuizz, totalParticipants (remainingQuizz +/- when create new or delete quizz)
        //Remove StartDate, EndDate. Scale by Total Quizz and Total Participants
        //Get Limit: res 3 new fields
        //Group Member: get rid of response invitation
        //Packages: total quizzes added up as subcription
        //Get Public Quizzes for user (not include private quizzes)
    }
}
