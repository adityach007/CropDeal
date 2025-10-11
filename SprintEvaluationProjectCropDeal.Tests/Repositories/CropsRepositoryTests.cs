using Microsoft.EntityFrameworkCore;
using Xunit;
using FluentAssertions;
using SprintEvaluationProjectCropDeal.Data;
using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Repositories.Implementations;

namespace SprintEvaluationProjectCropDeal.Tests.Repositories
{
    public class CropsRepositoryTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly CropsRepository _repository;

        public CropsRepositoryTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _repository = new CropsRepository(_context);
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnAllCrops()
        {
            // Arrange
            var crops = new List<Crops>
            {
                CreateTestCrop(1, "Wheat", "Grain", 1),
                CreateTestCrop(2, "Rice", "Grain", 2)
            };

            await _context.CropsDetails.AddRangeAsync(crops);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().HaveCount(2);
        }

        [Fact]
        public async Task GetByIdAsync_WithValidId_ShouldReturnCrop()
        {
            // Arrange
            var crop = CreateTestCrop(1, "Wheat", "Grain", 1);
            await _context.CropsDetails.AddAsync(crop);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByIdAsync(1);

            // Assert
            result.Should().NotBeNull();
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

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
