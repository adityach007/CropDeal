using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using FluentAssertions;
using SprintEvaluationProjectCropDeal.Controllers;
using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Services.Interfaces;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using IAuthService = SprintEvaluationProjectCropDeal.Services.Interfaces.IAuthorizationService;

namespace SprintEvaluationProjectCropDeal.Tests.Controllers
{
    [TestFixture]
    public class DealerControllerTests
    {
        private Mock<IDealerService> _mockDealerService;
        private Mock<ILogger<DealerController>> _mockLogger;
        private Mock<IAuthService> _mockAuthService;
        private DealerController _controller;

        [SetUp]
        public void Setup()
        {
            _mockDealerService = new Mock<IDealerService>();
            _mockLogger = new Mock<ILogger<DealerController>>();
            _mockAuthService = new Mock<IAuthService>();
            _controller = new DealerController(_mockDealerService.Object, _mockLogger.Object, _mockAuthService.Object);
        }

        [Test]
        public async Task GetAll_ShouldReturnOkWithDealers()
        {
            // Arrange
            var dealers = new List<Dealer>
            {
                CreateTestDealer(1, "John Dealer", "john@dealer.com"),
                CreateTestDealer(2, "Jane Dealer", "jane@dealer.com")
            };
            _mockDealerService.Setup(s => s.GetAllDealersAsync()).ReturnsAsync(dealers);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var returnedDealers = okResult.Value.Should().BeAssignableTo<IEnumerable<Dealer>>().Subject;
            returnedDealers.Should().HaveCount(2);
        }

        [Test]
        public async Task GetById_WithValidIdAndAuthorization_ShouldReturnOkWithDealer()
        {
            // Arrange
            var dealer = CreateTestDealer(1, "John Dealer", "john@dealer.com");
            _mockDealerService.Setup(s => s.GetDealerByIdAsync(1)).ReturnsAsync(dealer);
            _mockAuthService.Setup(a => a.CanAccessDealer(It.IsAny<ClaimsPrincipal>(), 1)).Returns(true);

            SetupControllerUser();

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var returnedDealer = okResult.Value.Should().BeOfType<Dealer>().Subject;
            returnedDealer.DealerId.Should().Be(1);
        }

        private static Dealer CreateTestDealer(int id, string name, string email)
        {
            return new Dealer
            {
                DealerId = id,
                DealerName = name,
                DealerEmailAddress = email,
                Password = "password123",
                DealerPhoneNumber = "1234567890",
                DealerAadharNumber = "123456789012",
                DealerBankAccount = "1234567890123456",
                DealerIFSCode = "IFSC0001234",
                DealerLocation = "Test Location",
                IsDealerIdActive = true
            };
        }

        private void SetupControllerUser()
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, "1"),
                new Claim(ClaimTypes.Role, "Admin")
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