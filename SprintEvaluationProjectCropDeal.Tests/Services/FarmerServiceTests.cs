using Moq;
using Xunit;
using FluentAssertions;
using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Services.Implementations;
using SprintEvaluationProjectCropDeal.Repositories.Interfaces;

namespace SprintEvaluationProjectCropDeal.Tests.Services
{
    public class FarmerServiceTests
    {
        private readonly Mock<IFarmerRepository> _mockRepository;
        private readonly FarmerService _farmerService;

        public FarmerServiceTests()
        {
            _mockRepository = new Mock<IFarmerRepository>();
            _farmerService = new FarmerService(_mockRepository.Object);
        }

        [Fact]
        public async Task GetAllFarmersAsync_ShouldReturnAllFarmers()
        {
            // Arrange
            var farmers = new List<Farmer>
            {
                new Farmer { FarmerId = 1, FarmerName = "John Doe", EmailAddressFarmer = "john@example.com" },
                new Farmer { FarmerId = 2, FarmerName = "Jane Smith", EmailAddressFarmer = "jane@example.com" }
            };
            _mockRepository.Setup(r => r.GetAllAsync()).ReturnsAsync(farmers);

            // Act
            var result = await _farmerService.GetAllFarmersAsync();

            // Assert
            result.Should().HaveCount(2);
            result.Should().BeEquivalentTo(farmers);
            _mockRepository.Verify(r => r.GetAllAsync(), Times.Once);
        }

        [Fact]
        public async Task CreateFarmerAsync_WithValidFarmer_ShouldReturnTrue()
        {
            // Arrange
            var farmer = new Farmer 
            { 
                FarmerName = "John Doe", 
                EmailAddressFarmer = "john@example.com",
                Password = "password123",
                FarmerPhoneNumber = "1234567890",
                FarmerAadharNumber = "123456789012",
                FarmerLocation = "Location"
            };

            _mockRepository.Setup(r => r.AddAsync(It.IsAny<Farmer>())).Returns(Task.CompletedTask);

            // Act
            var result = await _farmerService.CreateFarmerAsync(farmer);

            // Assert
            result.Should().BeTrue();
            _mockRepository.Verify(r => r.AddAsync(farmer), Times.Once);
        }
    }
}