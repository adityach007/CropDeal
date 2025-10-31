using Microsoft.EntityFrameworkCore;
using SprintEvaluationProjectCropDeal.Data;
using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Repositories.Interfaces;

namespace SprintEvaluationProjectCropDeal.Repositories.Implementations
{
    public class CropPurchaseRepository : ICropPurchaseRepository
    {
        private readonly ApplicationDbContext _context;

        public CropPurchaseRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CropPurchase>> GetAllAsync()
        {
            return await _context.CropPurchases.ToListAsync();
        }

        public async Task<CropPurchase?> GetByIdAsync(int id)
        {
            return await _context.CropPurchases.FindAsync(id);
        }

        public async Task<IEnumerable<CropPurchase>> GetByDealerIdAsync(int dealerId)
        {
            return await _context.CropPurchases
                .Include(p => p.Crop)
                    .ThenInclude(c => c.Farmer)
                .Where(p => p.DealerId == dealerId)
                .ToListAsync();
        }

        public async Task<IEnumerable<CropPurchase>> GetByCropIdAsync(int cropId)
        {
            return await _context.CropPurchases
                .Where(p => p.CropId == cropId)
                .ToListAsync();
        }

        public async Task AddAsync(CropPurchase purchase)
        {
            _context.CropPurchases.Add(purchase);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(CropPurchase purchase)
        {
            _context.CropPurchases.Update(purchase);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var purchase = await _context.CropPurchases.FindAsync(id);
            if (purchase != null)
            {
                _context.CropPurchases.Remove(purchase);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ConfirmPurchaseAndUpdateCropAsync(int purchaseId)
        {
            var purchase = await _context.CropPurchases.FindAsync(purchaseId);
            if (purchase == null || purchase.IsConfirmed)
                return false;

            var crop = await _context.CropsDetails.FindAsync(purchase.CropId);
            if (crop == null || crop.QuantityInKg < purchase.QuantityRequested)
                return false;

            purchase.IsConfirmed = true;
            crop.QuantityInKg -= purchase.QuantityRequested;

            _context.CropPurchases.Update(purchase);
            _context.CropsDetails.Update(crop);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<CropPurchase>> GetConfirmedPurchasesAsync()
        {
            return await _context.CropPurchases
                .Where(p => p.IsConfirmed)
                .ToListAsync();
        }

        public async Task<IEnumerable<CropPurchase>> GetPendingPurchasesAsync()
        {
            return await _context.CropPurchases
                .Where(p => !p.IsConfirmed)
                .ToListAsync();
        }

        public async Task<IEnumerable<CropPurchase>> GetReviewedPurchasesByCropIdAsync(int cropId)
        {
            return await _context.CropPurchases
                .Where(p => p.CropId == cropId && p.HasBeenReviewed)
                .ToListAsync();
        }
    }
}