using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using FluentAssertions;
using SprintEvaluationProjectCropDeal.Data;
using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Repositories.Implementations;

namespace SprintEvaluationProjectCropDeal.Tests.Repositories
{
    [TestFixture]
    public class DealerRepositoryTests
    {
        private ApplicationDbContext _context;
        private DealerRepository _repository;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _repository = new DealerRepository(_context);
        }

        [TearDown]
        public void TearDown()
        {
            _context.Dispose();
        }

        [Test]
        public async Task GetAllAsync_ShouldReturnAllDealers()
        {
            // Arrange
            var dealers = new List<Dealer>
            {
                CreateTestDealer(1, "John Dealer", "john@dealer.com"),
                CreateTestDealer(2, "Jane Dealer", "jane@dealer.com")
            };

            await _context.DealersDetails.AddRangeAsync(dealers);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            result.Should().HaveCount(2);
        }

        [Test]
        public async Task GetByIdAsync_WithValidId_ShouldReturnDealer()
        {
            // Arrange
            var dealer = CreateTestDealer(1, "John Dealer", "john@dealer.com");
            await _context.DealersDetails.AddAsync(dealer);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByIdAsync(1);

            // Assert
            result.Should().NotBeNull();
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
    }
}