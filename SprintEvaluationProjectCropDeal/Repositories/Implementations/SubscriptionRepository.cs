using Microsoft.EntityFrameworkCore;
using SprintEvaluationProjectCropDeal.Data;
using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Repositories.Interfaces;

namespace SprintEvaluationProjectCropDeal.Repositories.Implementations
{
    public class SubscriptionRepository : ISubscriptionRepository
    {
        private readonly ApplicationDbContext _context;

        public SubscriptionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<FarmerSubscription?> GetSubscriptionAsync(int dealerId, int farmerId)
        {
            return await _context.FarmerSubscriptions
                .FirstOrDefaultAsync(s => s.DealerId == dealerId && s.FarmerId == farmerId);
        }

        public async Task<IEnumerable<FarmerSubscription>> GetDealerSubscriptionsAsync(int dealerId)
        {
            return await _context.FarmerSubscriptions
                .Include(s => s.Farmer)
                .Where(s => s.DealerId == dealerId && s.IsActive)
                .ToListAsync();
        }

        public async Task<IEnumerable<FarmerSubscription>> GetFarmerSubscribersAsync(int farmerId)
        {
            return await _context.FarmerSubscriptions
                .Include(s => s.Dealer)
                .Where(s => s.FarmerId == farmerId && s.IsActive)
                .ToListAsync();
        }

        public async Task AddSubscriptionAsync(FarmerSubscription subscription)
        {
            await _context.FarmerSubscriptions.AddAsync(subscription);
        }

        public async Task RemoveSubscriptionAsync(FarmerSubscription subscription)
        {
            _context.FarmerSubscriptions.Remove(subscription);
            await Task.CompletedTask;
        }

        public async Task<bool> IsSubscribedAsync(int dealerId, int farmerId)
        {
            return await _context.FarmerSubscriptions
                .AnyAsync(s => s.DealerId == dealerId && s.FarmerId == farmerId && s.IsActive);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}