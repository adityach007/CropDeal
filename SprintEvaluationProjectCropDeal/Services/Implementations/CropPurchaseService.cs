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
        private readonly IEmailService _emailService;

        public CropPurchaseService(
            ICropPurchaseRepository cropPurchaseRepository,
            ICropsRepository cropsRepository,
            ILogger<CropPurchaseService> logger,
            ApplicationDbContext db,
            IEmailService emailService)
        {
            _cropPurchaseRepository = cropPurchaseRepository;
            _cropsRepository = cropsRepository;
            _logger = logger;
            _db = db;
            _emailService = emailService;
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

                // Get farmer details to send email
                var farmer = await _db.FarmersDetails.FindAsync(crop.FarmerId);
                if (farmer != null)
                {
                    _logger.LogInformation("Sending purchase request email to farmer: {Email}", farmer.EmailAddressFarmer);
                    
                    // Get dealer details for email
                    var dealer = await _db.DealersDetails.FindAsync(request.DealerId);
                    
                    // Calculate total amount
                    decimal totalAmount = request.QuantityRequested * crop.PricePerUnit;
                    
                    await _emailService.SendPurchaseRequestEmailAsync(
                        farmer.EmailAddressFarmer,
                        farmer.FarmerName,
                        dealer?.DealerName ?? "Unknown Dealer",
                        crop.CropName,
                        request.QuantityRequested,
                        totalAmount
                    );
                    
                    _logger.LogInformation("Purchase request email sent successfully to {Email}", farmer.EmailAddressFarmer);
                }
                
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

                // 3. Save changes (payment will be created later when dealer clicks Pay Now)
                var totalAmount = purchase.QuantityRequested * crop.PricePerUnit;

                _db.CropPurchases.Update(purchase);
                _db.CropsDetails.Update(crop);

                await _db.SaveChangesAsync();

                // 4. Send confirmation email to dealer
                var dealer = await _db.DealersDetails.FindAsync(purchase.DealerId);
                if (dealer != null)
                {
                    _logger.LogInformation("Sending purchase confirmation email to dealer: {Email}", dealer.DealerEmailAddress);

                    await _emailService.SendPurchaseConfirmedEmailAsync(
                        dealer.DealerEmailAddress,
                        dealer.DealerName,
                        crop.CropName,
                        purchase.QuantityRequested,
                        totalAmount
                    );

                    _logger.LogInformation("Purchase confirmation email sent to {Email}", dealer.DealerEmailAddress);
                }

                // 5. Check for low stock and send alert to farmer
                if (crop.QuantityInKg <= 10)
                {
                    var farmer = await _db.FarmersDetails.FindAsync(crop.FarmerId);
                    if (farmer != null)
                    {
                        _logger.LogInformation("Sending low stock alert to farmer: {Email}", farmer.EmailAddressFarmer);

                        await _emailService.SendLowStockAlertEmailAsync(
                            farmer.EmailAddressFarmer,
                            farmer.FarmerName,
                            crop.CropName,
                            crop.QuantityInKg
                        );

                        _logger.LogInformation("Low stock alert sent to {Email}", farmer.EmailAddressFarmer);
                    }
                }

                _logger.LogInformation("Purchase {PurchaseId} confirmed and crop quantity updated successfully", purchaseId);
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
                var purchase = await _db.CropPurchases
                    .Include(p => p.Crop)
                    .FirstOrDefaultAsync(p => p.PurchaseId == purchaseId);
                    
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

                // Send review notification to farmer
                var crop = purchase.Crop;
                if (crop != null)
                {
                    var farmer = await _db.FarmersDetails.FindAsync(crop.FarmerId);
                    var dealer = await _db.DealersDetails.FindAsync(purchase.DealerId);
                    
                    if (farmer != null && dealer != null)
                    {
                        _logger.LogInformation("Sending review notification to farmer: {Email}", farmer.EmailAddressFarmer);
                        
                        await _emailService.SendReviewNotificationEmailAsync(
                            farmer.EmailAddressFarmer,
                            farmer.FarmerName,
                            dealer.DealerName,
                            crop.CropName,
                            rating,
                            reviewText ?? ""
                        );
                        
                        _logger.LogInformation("Review notification sent to {Email}", farmer.EmailAddressFarmer);
                    }
                }

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