using Microsoft.EntityFrameworkCore;
using Xunit;
using FluentAssertions;
using SprintEvaluationProjectCropDeal.Data;
using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Repositories.Implementations;

namespace SprintEvaluationProjectCropDeal.Tests.Repositories
{
    public class FarmerRepositoryTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly FarmerRepository _repository;

        public FarmerRepositoryTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _repository = new FarmerRepository(_context);
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnAllFarmers()
        {
            // Arrange
            var farmers = new List<Farmer>
            {
                CreateTestFarmer(1, "John Doe", "john@example.com"),
                CreateTestFarmer(2, "Jane Smith", "jane@example.com")
            };

            await _context.FarmersDetails.AddRangeAsync(farmers);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().HaveCount(2);
        }

        [Fact]
        public async Task GetByIdAsync_WithValidId_ShouldReturnFarmer()
        {
            // Arrange
            var farmer = CreateTestFarmer(1, "John Doe", "john@example.com");
            await _context.FarmersDetails.AddAsync(farmer);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByIdAsync(1);

            // Assert
            result.Should().NotBeNull();
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

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}