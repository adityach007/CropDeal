using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SprintEvaluationProjectCropDeal.Data;
using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Models.DTOs.Auth;
using SprintEvaluationProjectCropDeal.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace SprintEvaluationProjectCropDeal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _config;
        private readonly IFarmerService _farmerService;
        private readonly IDealerService _dealerService;
        private readonly IAdminService _adminService;
        private readonly IEmailService _emailService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            ApplicationDbContext db,
            IConfiguration config,
            IFarmerService farmerService,
            IDealerService dealerService,
            IAdminService adminService,
            IEmailService emailService,
            ILogger<AuthController> logger)
        {
            _db = db;
            _config = config;
            _farmerService = farmerService;
            _dealerService = dealerService;
            _adminService = adminService;
            _emailService = emailService;
            _logger = logger;
        }

        // POST: api/auth/register
        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Validate required fields based on user type
                var validationResult = ValidateRegisterRequest(request);
                if (validationResult != null)
                    return BadRequest(validationResult);

                // Check if email already exists
                var emailExists = await CheckEmailExists(request.Email);
                if (emailExists)
                    return BadRequest("Email already registered");

                var hashedPassword = HashPassword(request.Password);

                object newUser;
                int userId;
                string userRole;

                // Create user based on type
                switch (request.UserType)
                {
                    case UserType.Farmer:
                        var farmer = new Farmer
                        {
                            FarmerName = request.Name,
                            FarmerPhoneNumber = request.PhoneNumber,
                            EmailAddressFarmer = request.Email,
                            FarmerAadharNumber = request.AadharNumber,
                            FarmerBankAccount = request.BankAccount,
                            FarmerIFSCCode = request.IFSCCode,
                            FarmerLocation = request.Location,
                            IsFarmerIdActive = request.IsActive,
                            Password = hashedPassword
                        };
                        await _farmerService.AddAsync(farmer);
                        newUser = farmer;
                        userId = farmer.FarmerId;
                        userRole = "Farmer";

                        // Send welcome email to farmer
                        try
                        {
                            _logger.LogInformation("Sending welcome email to new farmer: {Email}", request.Email);
                            await _emailService.SendWelcomeEmailAsync(request.Email, request.Name, userRole);
                            _logger.LogInformation("Welcome email sent successfully to {Email}", request.Email);
                        }
                        catch (Exception emailEx)
                        {
                            _logger.LogError(emailEx, "Failed to send welcome email to {Email}, but registration succeeded", request.Email);
                        }
                        break;

                    case UserType.Dealer:
                        var dealer = new Dealer
                        {
                            DealerName = request.Name,
                            DealerPhoneNumber = request.PhoneNumber,
                            DealerEmailAddress = request.Email,
                            DealerAadharNumber = request.AadharNumber,
                            DealerBankAccount = request.BankAccount,
                            DealerIFSCode = request.IFSCCode,
                            DealerLocation = request.Location,
                            IsDealerIdActive = request.IsActive,
                            Password = hashedPassword
                        };
                        await _dealerService.AddAsync(dealer);
                        newUser = dealer;
                        userId = dealer.DealerId;
                        userRole = "Dealer";

                        // Send welcome email to dealer
                        try
                        {
                            _logger.LogInformation("Sending welcome email to new dealer: {Email}", request.Email);
                            await _emailService.SendWelcomeEmailAsync(request.Email, request.Name, userRole);
                            _logger.LogInformation("Welcome email sent successfully to {Email}", request.Email);
                        }
                        catch (Exception emailEx)
                        {
                            _logger.LogError(emailEx, "Failed to send welcome email to {Email}, but registration succeeded", request.Email);
                        }
                        break;

                    case UserType.Admin:
                        var admin = new Admin
                        {
                            AdminName = request.Name,
                            AdminPhoneNumber = request.PhoneNumber,
                            AdminEmailAddress = request.Email,
                            AdminAadharNumber = request.AadharNumber,
                            AdminBankAccount = request.BankAccount,
                            AdminIFSCCode = request.IFSCCode,
                            IsAdminIdActive = request.IsActive,
                            Password = hashedPassword
                        };
                        await _adminService.AddAsync(admin);
                        newUser = admin;
                        userId = admin.AdminId;
                        userRole = "Admin";

                        // Send welcome email to admin
                        try
                        {
                            _logger.LogInformation("Sending welcome email to new admin: {Email}", request.Email);
                            await _emailService.SendWelcomeEmailAsync(request.Email, request.Name, userRole);
                            _logger.LogInformation("Welcome email sent successfully to {Email}", request.Email);
                        }
                        catch (Exception emailEx)
                        {
                            _logger.LogError(emailEx, "Failed to send welcome email to {Email}, but registration succeeded", request.Email);
                        }
                        break;

                    default:
                        return BadRequest("Invalid user type");
                }

                var token = GenerateJwtToken(request.Email, userRole, userId.ToString());

                return Ok(new AuthResponse
                {
                    UserId = userId,
                    Name = request.Name,
                    Email = request.Email,
                    UserType = request.UserType,
                    Token = token,
                    Message = $"{userRole} registered successfully. Welcome email sent!"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration");
                return StatusCode(500, "Internal server error during registration");
            }
        }

        // POST: api/auth/login
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Check farmers table
                var farmer = await _farmerService.GetByEmailAsync(request.Email);
                if (farmer != null)
                {
                    if (!farmer.IsFarmerIdActive)
                        return BadRequest("Farmer account is inactive");

                    if (VerifyPassword(request.Password, farmer.Password))
                    {
                        var token = GenerateJwtToken(farmer.EmailAddressFarmer, "Farmer", farmer.FarmerId.ToString());
                        return Ok(new AuthResponse
                        {
                            UserId = farmer.FarmerId,
                            Name = farmer.FarmerName,
                            Email = farmer.EmailAddressFarmer,
                            UserType = UserType.Farmer,
                            Token = token,
                            Message = "Farmer login successful"
                        });
                    }
                }

                // Check dealers table
                var dealer = await _dealerService.GetByEmailAsync(request.Email);
                if (dealer != null)
                {
                    if (!dealer.IsDealerIdActive)
                        return BadRequest("Dealer account is inactive");

                    if (VerifyPassword(request.Password, dealer.Password))
                    {
                        var token = GenerateJwtToken(dealer.DealerEmailAddress, "Dealer", dealer.DealerId.ToString());
                        return Ok(new AuthResponse
                        {
                            UserId = dealer.DealerId,
                            Name = dealer.DealerName,
                            Email = dealer.DealerEmailAddress,
                            UserType = UserType.Dealer,
                            Token = token,
                            Message = "Dealer login successful"
                        });
                    }
                }

                // Check admins table
                var admin = await _adminService.GetByEmailAsync(request.Email);
                if (admin != null)
                {
                    if (!admin.IsAdminIdActive)
                        return BadRequest("Admin account is inactive");

                    if (VerifyPassword(request.Password, admin.Password))
                    {
                        var token = GenerateJwtToken(admin.AdminEmailAddress, "Admin", admin.AdminId.ToString());
                        return Ok(new AuthResponse
                        {
                            UserId = admin.AdminId,
                            Name = admin.AdminName,
                            Email = admin.AdminEmailAddress,
                            UserType = UserType.Admin,
                            Token = token,
                            Message = "Admin login successful"
                        });
                    }
                }

                return BadRequest("Invalid email or password");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login");
                return StatusCode(500, "Internal server error during login");
            }
        }

        private string ValidateRegisterRequest(RegisterRequest request)
        {
            switch (request.UserType)
            {
                case UserType.Farmer:
                    if (string.IsNullOrEmpty(request.Location))
                        return "Location is required for farmers";
                    break;
                case UserType.Dealer:
                    if (string.IsNullOrEmpty(request.Location))
                        return "Location is required for dealers";
                    break;
                case UserType.Admin:
                    // Admin might not need location
                    break;
            }
            return null;
        }

        private async Task<bool> CheckEmailExists(string email)
        {
            var farmerExists = await _farmerService.GetByEmailAsync(email) != null;
            var dealerExists = await _dealerService.GetByEmailAsync(email) != null;
            var adminExists = await _adminService.GetByEmailAsync(email) != null;

            return farmerExists || dealerExists || adminExists;
        }

        private string GenerateJwtToken(string email, string role, string userId)
        {
            var jwtKey = _config["Jwt:Key"];
            var jwtIssuer = _config["Jwt:Issuer"];
            var jwtAudience = _config["Jwt:Audience"];

            if (string.IsNullOrEmpty(jwtKey))
                throw new InvalidOperationException("JWT Key is not configured");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Email, email),
                new Claim(ClaimTypes.Role, role),
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(JwtRegisteredClaimNames.Sub, email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, 
                    new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds().ToString(), 
                    ClaimValueTypes.Integer64)
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string HashPassword(string password)
        {
            using var rng = RandomNumberGenerator.Create();
            byte[] saltBytes = new byte[16];
            rng.GetBytes(saltBytes);
            
            var pbkdf2 = new Rfc2898DeriveBytes(password, saltBytes, 10000, HashAlgorithmName.SHA256);
            byte[] hashBytes = pbkdf2.GetBytes(32);
            
            byte[] hashWithSaltBytes = new byte[48];
            Array.Copy(saltBytes, 0, hashWithSaltBytes, 0, 16);
            Array.Copy(hashBytes, 0, hashWithSaltBytes, 16, 32);
            
            return Convert.ToBase64String(hashWithSaltBytes);
        }

        private bool VerifyPassword(string password, string hash)
        {
            if (string.IsNullOrEmpty(hash))
                return false;

            try
            {
                byte[] hashWithSaltBytes = Convert.FromBase64String(hash);

                if (hashWithSaltBytes.Length != 48)
                    return false;

                byte[] saltBytes = new byte[16];
                Array.Copy(hashWithSaltBytes, 0, saltBytes, 0, 16);

                var pbkdf2 = new Rfc2898DeriveBytes(password, saltBytes, 10000, HashAlgorithmName.SHA256);
                byte[] hashBytes = pbkdf2.GetBytes(32);

                for (int i = 0; i < 32; i++)
                {
                    if (hashWithSaltBytes[i + 16] != hashBytes[i])
                        return false;
                }

                return true;
            }
            catch
            {
                return false;
            }
        }
        
        [HttpGet("debug/verify-token")]
        [Authorize]
        public IActionResult VerifyToken()
        {
            var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
            var identity = User.Identity;
            
            return Ok(new
            {
                IsAuthenticated = identity?.IsAuthenticated,
                AuthenticationType = identity?.AuthenticationType,
                Name = identity?.Name,
                Claims = claims,
                Role = User.FindFirst(ClaimTypes.Role)?.Value,
                UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            });
        }
    }
}