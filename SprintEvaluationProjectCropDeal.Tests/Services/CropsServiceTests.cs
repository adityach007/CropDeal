using Moq;
using NUnit.Framework;
using FluentAssertions;
using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Services.Implementations;
using SprintEvaluationProjectCropDeal.Repositories.Interfaces;
using SprintEvaluationProjectCropDeal.Services.Interfaces;

namespace SprintEvaluationProjectCropDeal.Tests.Services
{
    [TestFixture]
    public class CropsServiceTests
    {
        private Mock<ICropsRepository> _mockCropsRepository;
        private Mock<IEmailService> _mockEmailService;
        private Mock<IFarmerRepository> _mockFarmerRepository;
        private CropsService _cropsService;

        [SetUp]
        public void Setup()
        {
            _mockCropsRepository = new Mock<ICropsRepository>();
            _mockEmailService = new Mock<IEmailService>();
            _mockFarmerRepository = new Mock<IFarmerRepository>();
            _cropsService = new CropsService(
                _mockCropsRepository.Object, 
                _mockEmailService.Object, 
                _mockFarmerRepository.Object
            );
        }

        [Test]
        public async Task GetAllCropsAsync_ShouldReturnAllCrops()
        {
            // Arrange
            var crops = new List<Crops>
            {
                new Crops { CropId = 1, CropName = "Wheat", CropType = "Grain", FarmerId = 1 },
                new Crops { CropId = 2, CropName = "Rice", CropType = "Grain", FarmerId = 2 }
            };
            _mockCropsRepository.Setup(r => r.GetAllAsync()).ReturnsAsync(crops);

            // Act
            var result = await _cropsService.GetAllCropsAsync();

            // Assert
            result.Should().HaveCount(2);
            result.Should().BeEquivalentTo(crops);
            _mockCropsRepository.Verify(r => r.GetAllAsync(), Times.Once);
        }

        [Test]
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

            _mockCropsRepository.Setup(r => r.AddAsync(It.IsAny<Crops>())).Returns(Task.CompletedTask);

            // Act
            var result = await _cropsService.CreateCropAsync(crop);

            // Assert
            result.Should().BeTrue();
            _mockCropsRepository.Verify(r => r.AddAsync(crop), Times.Once);
        }
    }
}