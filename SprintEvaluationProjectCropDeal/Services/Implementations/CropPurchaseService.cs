using Microsoft.EntityFrameworkCore;
using SprintEvaluationProjectCropDeal.Data;
using SprintEvaluationProjectCropDeal.Models; 
using SprintEvaluationProjectCropDeal.Models.DTOs.Payment;
using SprintEvaluationProjectCropDeal.Repositories.Interfaces;
using SprintEvaluationProjectCropDeal.Services.Interfaces;

namespace SprintEvaluationProjectCropDeal.Services.Implementations
{
    public class CropPurchaseService : ICropPurchaseService
    {
        private readonly ICropPurchaseRepository _cropPurchaseRepository;
        private readonly ICropsRepository _cropsRepository;
        private readonly ILogger<CropPurchaseService> _logger;
        private readonly ApplicationDbContext _db;

        public CropPurchaseService(
            ICropPurchaseRepository cropPurchaseRepository,
            ICropsRepository cropsRepository,
            ILogger<CropPurchaseService> logger,
            ApplicationDbContext db)
        {
            _cropPurchaseRepository = cropPurchaseRepository;
            _cropsRepository = cropsRepository;
            _logger = logger;
            _db = db;
        }

        public async Task<bool> CreatePurchaseRequestAsync(CropPurchaseRequest request)
        {
            try
            {
                var crop = await _cropsRepository.GetByIdAsync(request.CropId);
                if (crop == null)
                    return false;

                var purchase = new CropPurchase
                {
                    CropId = request.CropId,
                    DealerId = request.DealerId,
                    QuantityRequested = request.QuantityRequested,
                    RequestedAt = DateTime.UtcNow,
                    IsConfirmed = false
                };

                await _cropPurchaseRepository.AddAsync(purchase);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating purchase request");
                return false;
            }
        }

        public async Task<IEnumerable<CropPurchase>> GetPurchasesByDealerAsync(int dealerId)
        {
            return await _cropPurchaseRepository.GetByDealerIdAsync(dealerId);
        }

        public async Task<IEnumerable<CropPurchase>> GetPurchasesByFarmerIdAsync(int farmerId)
        {
            return await _db.CropPurchases
                .Include(p => p.Crop)
                .Where(p => p.Crop.FarmerId == farmerId)
                .ToListAsync();
        }

        public async Task<IEnumerable<CropPurchase>> GetPurchasesByDealerIdAsync(int dealerId)
        {
            return await _cropPurchaseRepository.GetByDealerIdAsync(dealerId);
        }

        public async Task<IEnumerable<CropPurchase>> GetAllCropPurchasesAsync()
        {
            return await _cropPurchaseRepository.GetAllAsync();
        }

        public async Task<CropPurchase?> GetCropPurchaseByIdAsync(int id)
        {
            return await _cropPurchaseRepository.GetByIdAsync(id);
        }

        public async Task<bool> CreateCropPurchaseAsync(CropPurchase cropPurchase)
        {
            try
            {
                await _cropPurchaseRepository.AddAsync(cropPurchase);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating crop purchase");
                return false;
            }
        }

        public async Task<bool> UpdateCropPurchaseAsync(CropPurchase cropPurchase)
        {
            try
            {
                await _cropPurchaseRepository.UpdateAsync(cropPurchase);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating crop purchase");
                return false;
            }
        }

        public async Task<bool> DeleteCropPurchaseAsync(int id)
        {
            try
            {
                await _cropPurchaseRepository.DeleteAsync(id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting crop purchase");
                return false;
            }
        }

        public async Task<bool> ConfirmPurchaseAndUpdateCropAsync(int purchaseId)
        {
            try
            {
                // Get the purchase with crop details
                var purchase = await _db.CropPurchases
                    .Include(p => p.Crop)
                    .FirstOrDefaultAsync(p => p.PurchaseId == purchaseId);

                if (purchase == null || purchase.IsConfirmed)
                {
                    _logger.LogWarning("Purchase {PurchaseId} not found or already confirmed", purchaseId);
                    return false;
                }

                var crop = purchase.Crop;
                if (crop == null)
                {
                    _logger.LogError("Crop not found for purchase {PurchaseId}", purchaseId);
                    return false;
                }

                // Check if enough quantity available
                if (crop.QuantityInKg < purchase.QuantityRequested)
                {
                    _logger.LogWarning("Insufficient quantity for purchase {PurchaseId}. Available: {Available}, Requested: {Requested}", 
                        purchaseId, crop.QuantityInKg, purchase.QuantityRequested);
                    return false;
                }

                // 1. Update purchase status
                purchase.IsConfirmed = true;

                // 2. Reduce crop quantity
                crop.QuantityInKg -= purchase.QuantityRequested;

                // 3. CREATE PAYMENT AUTOMATICALLY
                var totalAmount = purchase.QuantityRequested * crop.PricePerUnit;
                
                var payment = new Payment
                {
                    FarmerId = crop.FarmerId,
                    DealerId = purchase.DealerId,
                    CropId = purchase.CropId,
                    PurchaseId = purchase.PurchaseId,
                    Amount = totalAmount,
                    TransactionDate = DateTime.UtcNow,
                    TransactionStatus = "Pending",
                    CanBeReviewed = false
                };

                _db.CropPurchases.Update(purchase);
                _db.CropsDetails.Update(crop);
                _db.PaymentsDetails.Add(payment);

                await _db.SaveChangesAsync();
                
                _logger.LogInformation("Purchase {PurchaseId} confirmed, crop quantity updated, and payment created successfully", purchaseId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error confirming purchase {PurchaseId}", purchaseId);
                return false;
            }
        }

        public async Task<IEnumerable<CropPurchase>> GetReviewedPurchasesByCropIdAsync(int cropId)
        {
            return await _db.CropPurchases
                .Where(p => p.CropId == cropId && p.HasBeenReviewed)
                .ToListAsync();
        }

        public async Task<bool> SubmitReviewAsync(int purchaseId, int rating, string? reviewText)
        {
            try
            {
                var purchase = await _db.CropPurchases.FindAsync(purchaseId);
                if (purchase == null || !purchase.IsConfirmed || purchase.HasBeenReviewed)
                {
                    return false;
                }

                purchase.Rating = rating;
                purchase.ReviewText = reviewText;
                purchase.ReviewDate = DateTime.UtcNow;
                purchase.HasBeenReviewed = true;

                _db.CropPurchases.Update(purchase);
                await _db.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting review for purchase {PurchaseId}", purchaseId);
                return false;
            }
        }

        public async Task<IEnumerable<CropPurchase>> GetReviewsByDealerIdAsync(int dealerId)
        {
            return await _db.CropPurchases
                .Where(p => p.DealerId == dealerId && p.HasBeenReviewed)
                .ToListAsync();
        }

        public async Task<IEnumerable<CropPurchase>> GetReviewsForFarmerCropsAsync(int farmerId)
        {
            return await _db.CropPurchases
                .Include(p => p.Crop)
                .Where(p => p.Crop.FarmerId == farmerId && p.HasBeenReviewed)
                .ToListAsync();
        }

        public async Task<bool> CanPurchaseBeReviewedAsync(int purchaseId, int dealerId)
        {
            var purchase = await _db.CropPurchases.FindAsync(purchaseId);
            if (purchase == null)
                return false;

            return purchase.DealerId == dealerId && 
                   purchase.IsConfirmed && 
                   !purchase.HasBeenReviewed;
        }

        public async Task<double> GetAverageRatingForCropAsync(int cropId)
        {
            var reviews = await _db.CropPurchases
                .Where(p => p.CropId == cropId && p.HasBeenReviewed && p.Rating.HasValue)
                .ToListAsync();

            if (!reviews.Any())
                return 0;

            return reviews.Average(p => p.Rating!.Value);
        }

        public async Task<int> GetTotalReviewsForCropAsync(int cropId)
        {
            return await _db.CropPurchases
                .CountAsync(p => p.CropId == cropId && p.HasBeenReviewed);
        }
    }
}