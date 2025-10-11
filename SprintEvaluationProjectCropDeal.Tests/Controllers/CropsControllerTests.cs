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
    public class CropsControllerTests
    {
        private readonly Mock<ICropsService> _mockCropsService;
        private readonly Mock<ILogger<CropsController>> _mockLogger;
        private readonly Mock<IAuthService> _mockAuthService;
        private readonly CropsController _controller;

        public CropsControllerTests()
        {
            _mockCropsService = new Mock<ICropsService>();
            _mockLogger = new Mock<ILogger<CropsController>>();
            _mockAuthService = new Mock<IAuthService>();
            _controller = new CropsController(_mockCropsService.Object, _mockLogger.Object, _mockAuthService.Object);
        }

        [Fact]
        public async Task GetById_WithValidId_ShouldReturnOkWithCrop()
        {
            // Arrange
            var crop = CreateTestCrop(1, "Tomato", "Vegetable", 1);
            _mockCropsService.Setup(s => s.GetCropByIdAsync(1)).ReturnsAsync(crop);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var returnedCrop = okResult.Value.Should().BeOfType<Crops>().Subject;
            returnedCrop.CropId.Should().Be(1);
        }

        [Fact]
        public async Task Create_WithValidCrop_ShouldReturnCreatedResult()
        {
            // Arrange
            var crop = CreateTestCrop(0, "Tomato", "Vegetable", 1);
            _mockAuthService.Setup(a => a.GetCurrentUserId(It.IsAny<ClaimsPrincipal>())).Returns(1);
            _mockCropsService.Setup(s => s.CreateCropAsync(It.IsAny<Crops>())).ReturnsAsync(true);

            SetupControllerUser();

            // Act
            var result = await _controller.Create(crop);

            // Assert
            var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
            createdResult.ActionName.Should().Be(nameof(_controller.GetById));
        }

        private static Crops CreateTestCrop(int id, string name, string type, int farmerId)
        {
            return new Crops
            {
                CropId = id,
                CropName = name,
                CropType = type,
                QuantityInKg = 100,
                Location = "Test Location",
                FarmerId = farmerId
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
