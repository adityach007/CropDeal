using Moq;
using NUnit.Framework;
using FluentAssertions;
using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Services.Implementations;
using SprintEvaluationProjectCropDeal.Repositories.Interfaces;

namespace SprintEvaluationProjectCropDeal.Tests.Services
{
    [TestFixture]
    public class DealerServiceTests
    {
        private Mock<IDealerRepository> _mockRepository;
        private DealerService _dealerService;

        [SetUp]
        public void Setup()
        {
            _mockRepository = new Mock<IDealerRepository>();
            _dealerService = new DealerService(_mockRepository.Object);
        }

        [Test]
        public async Task GetAllDealersAsync_ShouldReturnAllDealers()
        {
            // Arrange
            var dealers = new List<Dealer>
            {
                new Dealer { DealerId = 1, DealerName = "John Dealer", DealerEmailAddress = "john@dealer.com" },
                new Dealer { DealerId = 2, DealerName = "Jane Dealer", DealerEmailAddress = "jane@dealer.com" }
            };
            _mockRepository.Setup(r => r.GetAllAsync()).ReturnsAsync(dealers);

            // Act
            var result = await _dealerService.GetAllDealersAsync();

            // Assert
            result.Should().HaveCount(2);
            result.Should().BeEquivalentTo(dealers);
            _mockRepository.Verify(r => r.GetAllAsync(), Times.Once);
        }

        [Test]
        public async Task CreateDealerAsync_WithValidDealer_ShouldReturnTrue()
        {
            // Arrange
            var dealer = new Dealer 
            { 
                DealerName = "John Dealer", 
                DealerEmailAddress = "john@dealer.com",
                Password = "password123",
                DealerPhoneNumber = "1234567890",
                DealerAadharNumber = "123456789012",
                DealerLocation = "Location"
            };

            _mockRepository.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((Dealer?)null);
            _mockRepository.Setup(r => r.GetByAadharAsync(It.IsAny<string>())).ReturnsAsync((Dealer?)null);
            _mockRepository.Setup(r => r.AddAsync(It.IsAny<Dealer>())).Returns(Task.CompletedTask);

            // Act
            var result = await _dealerService.CreateDealerAsync(dealer);

            // Assert
            result.Should().BeTrue();
            _mockRepository.Verify(r => r.AddAsync(dealer), Times.Once);
        }
    }
}