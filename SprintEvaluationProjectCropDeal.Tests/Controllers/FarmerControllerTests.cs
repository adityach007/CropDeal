using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using FluentAssertions;
using SprintEvaluationProjectCropDeal.Controllers;
using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Services.Interfaces;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using IAuthService = SprintEvaluationProjectCropDeal.Services.Interfaces.IAuthorizationService;

namespace SprintEvaluationProjectCropDeal.Tests.Controllers
{
    public class FarmerControllerTests
    {
        private readonly Mock<IFarmerService> _mockFarmerService;
        private readonly Mock<ILogger<FarmerController>> _mockLogger;
        private readonly Mock<IAuthService> _mockAuthService;
        private readonly FarmerController _controller;

        public FarmerControllerTests()
        {
            _mockFarmerService = new Mock<IFarmerService>();
            _mockLogger = new Mock<ILogger<FarmerController>>();
            _mockAuthService = new Mock<IAuthService>();
            _controller = new FarmerController(_mockFarmerService.Object, _mockLogger.Object, _mockAuthService.Object);
        }

        [Fact]
        public async Task GetAll_ShouldReturnOkWithFarmers()
        {
            // Arrange
            var farmers = new List<Farmer>
            {
                CreateTestFarmer(1, "John Doe", "john@example.com"),
                CreateTestFarmer(2, "Jane Smith", "jane@example.com")
            };
            _mockFarmerService.Setup(s => s.GetAllFarmersAsync()).ReturnsAsync(farmers);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var returnedFarmers = okResult.Value.Should().BeAssignableTo<IEnumerable<Farmer>>().Subject;
            returnedFarmers.Should().HaveCount(2);
        }

        [Fact]
        public async Task GetById_WithValidIdAndAuthorization_ShouldReturnOkWithFarmer()
        {
            // Arrange
            var farmer = CreateTestFarmer(1, "John Doe", "john@example.com");
            _mockFarmerService.Setup(s => s.GetFarmerByIdAsync(1)).ReturnsAsync(farmer);
            _mockAuthService.Setup(a => a.CanAccessFarmer(It.IsAny<ClaimsPrincipal>(), 1)).Returns(true);

            SetupControllerUser();

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var returnedFarmer = okResult.Value.Should().BeOfType<Farmer>().Subject;
            returnedFarmer.FarmerId.Should().Be(1);
        }

        private static Farmer CreateTestFarmer(int id, string name, string email)
        {
            return new Farmer
            {
                FarmerId = id,
                FarmerName = name,
                EmailAddressFarmer = email,
                Password = "password123",
                FarmerPhoneNumber = "1234567890",
                FarmerAadharNumber = "123456789012",
                FarmerBankAccount = "1234567890123456",
                FarmerIFSCCode = "IFSC0001234",
                FarmerLocation = "Test Location",
                IsFarmerIdActive = true
            };
        }

        private void SetupControllerUser()
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, "1"),
                new Claim(ClaimTypes.Role, "Farmer")
            };

            var identity = new ClaimsIdentity(claims, "Test");
            var principal = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = principal
                }
            };
        }
    }
}