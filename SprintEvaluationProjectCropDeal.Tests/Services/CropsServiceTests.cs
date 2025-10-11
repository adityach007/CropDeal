using Moq;
using Xunit;
using FluentAssertions;
using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Services.Implementations;
using SprintEvaluationProjectCropDeal.Repositories.Interfaces;

namespace SprintEvaluationProjectCropDeal.Tests.Services
{
    public class CropsServiceTests
    {
        private readonly Mock<ICropsRepository> _mockRepository;
        private readonly CropsService _cropsService;

        public CropsServiceTests()
        {
            _mockRepository = new Mock<ICropsRepository>();
            _cropsService = new CropsService(_mockRepository.Object);
        }

        [Fact]
        public async Task GetAllCropsAsync_ShouldReturnAllCrops()
        {
            // Arrange
            var crops = new List<Crops>
            {
                new Crops { CropId = 1, CropName = "Wheat", CropType = "Grain", FarmerId = 1 },
                new Crops { CropId = 2, CropName = "Rice", CropType = "Grain", FarmerId = 2 }
            };
            _mockRepository.Setup(r => r.GetAllAsync()).ReturnsAsync(crops);

            // Act
            var result = await _cropsService.GetAllCropsAsync();

            // Assert
            result.Should().HaveCount(2);
            result.Should().BeEquivalentTo(crops);
            _mockRepository.Verify(r => r.GetAllAsync(), Times.Once);
        }

        [Fact]
        public async Task CreateCropAsync_WithValidCrop_ShouldReturnTrue()
        {
            // Arrange
            var crop = new Crops 
            { 
                CropName = "Wheat", 
                CropType = "Grain",
                QuantityInKg = 100,
                Location = "Farm Location",
                FarmerId = 1
            };

            _mockRepository.Setup(r => r.AddAsync(It.IsAny<Crops>())).Returns(Task.CompletedTask);

            // Act
            var result = await _cropsService.CreateCropAsync(crop);

            // Assert
            result.Should().BeTrue();
            _mockRepository.Verify(r => r.AddAsync(crop), Times.Once);
        }
    }
}
