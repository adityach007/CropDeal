using Microsoft.EntityFrameworkCore;
using SprintEvaluationProjectCropDeal.Data;
using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Repositories.Interfaces;

namespace SprintEvaluationProjectCropDeal.Repositories.Implementations;

public class DealerRepository : IDealerRepository
{
    private readonly ApplicationDbContext _context;

    public DealerRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Dealer>> GetAllAsync()
    {
        return await _context.DealersDetails.ToListAsync();
    }

    public async Task<Dealer?> GetByIdAsync(int id)
    {
        return await _context.DealersDetails.FindAsync(id);
    }

    public async Task<Dealer?> GetByEmailAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return null;

        return await _context.DealersDetails
            .FirstOrDefaultAsync(d => d.DealerEmailAddress == email);
    }

    public async Task<Dealer?> GetByAadharAsync(string aadharNumber)
    {
        if (string.IsNullOrWhiteSpace(aadharNumber))
            return null;

        return await _context.DealersDetails
            .FirstOrDefaultAsync(d => d.DealerAadharNumber == aadharNumber);
    }

    public async Task<Dealer?> GetByPhoneAsync(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return null;

        return await _context.DealersDetails
            .FirstOrDefaultAsync(d => d.DealerPhoneNumber == phoneNumber);
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.DealersDetails
            .AnyAsync(d => d.DealerId == id);
    }

    public async Task AddAsync(Dealer dealer)
    {
        if (dealer == null)
            throw new ArgumentNullException(nameof(dealer));

        await _context.DealersDetails.AddAsync(dealer);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Dealer dealer)
    {
        if (dealer == null)
            throw new ArgumentNullException(nameof(dealer));

        _context.DealersDetails.Update(dealer);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var dealer = await _context.DealersDetails.FindAsync(id);
        if (dealer != null)
        {
            _context.DealersDetails.Remove(dealer);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<FarmerSubscription?> GetSubscriptionAsync(int dealerId, int farmerId)
    {
        return await _context.FarmerSubscriptions
            .FirstOrDefaultAsync(fs => fs.DealerId == dealerId && fs.FarmerId == farmerId);
    }

    public async Task<FarmerSubscription?> GetActiveSubscriptionAsync(int dealerId, int farmerId)
    {
        return await _context.FarmerSubscriptions
            .FirstOrDefaultAsync(fs => fs.DealerId == dealerId && fs.FarmerId == farmerId && fs.IsActive);
    }

    public async Task AddSubscriptionAsync(FarmerSubscription subscription)
    {
        await _context.FarmerSubscriptions.AddAsync(subscription);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateSubscriptionAsync(FarmerSubscription subscription)
    {
        _context.FarmerSubscriptions.Update(subscription);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<FarmerSubscription>> GetSubscribedFarmersAsync(int dealerId)
    {
        return await _context.FarmerSubscriptions
            .Where(fs => fs.DealerId == dealerId && fs.IsActive)
            .Include(fs => fs.Farmer)
            .ThenInclude(f => f.Crops)
            .ToListAsync();
    }

    public async Task<int> GetSubscriptionCountAsync(int farmerId)
    {
        return await _context.FarmerSubscriptions
            .CountAsync(fs => fs.FarmerId == farmerId && fs.IsActive);
    }

    public async Task UpdateFarmerSubscriberCountAsync(int farmerId, int count)
    {
        var farmer = await _context.FarmersDetails.FindAsync(farmerId);
        if (farmer != null)
        {
            farmer.SubscriberCount = count;
            await _context.SaveChangesAsync();
        }
    }
}