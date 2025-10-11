using SprintEvaluationProjectCropDeal.Models; 
using SprintEvaluationProjectCropDeal.Models.DTOs.Payment;


namespace SprintEvaluationProjectCropDeal.Services.Interfaces
{
    public interface ICropPurchaseService
    {
        // Existing methods
        Task<bool> CreatePurchaseRequestAsync(CropPurchaseRequest request);
        Task<IEnumerable<CropPurchase>> GetPurchasesByDealerAsync(int dealerId);
        Task<bool> ConfirmPurchaseAndUpdateCropAsync(int purchaseId);
        
        // Missing methods needed by controller
        Task<IEnumerable<CropPurchase>> GetAllCropPurchasesAsync();
        Task<IEnumerable<CropPurchase>> GetPurchasesByFarmerIdAsync(int farmerId);
        Task<IEnumerable<CropPurchase>> GetPurchasesByDealerIdAsync(int dealerId);
        Task<CropPurchase?> GetCropPurchaseByIdAsync(int purchaseId);
        Task<bool> CreateCropPurchaseAsync(CropPurchase purchase);
        Task<bool> UpdateCropPurchaseAsync(CropPurchase purchase);
        Task<bool> DeleteCropPurchaseAsync(int purchaseId);

        Task<IEnumerable<CropPurchase>> GetReviewedPurchasesByCropIdAsync(int cropId);
        Task<bool> SubmitReviewAsync(int purchaseId, int rating, string? reviewText);
        Task<IEnumerable<CropPurchase>> GetReviewsByDealerIdAsync(int dealerId);
        Task<IEnumerable<CropPurchase>> GetReviewsForFarmerCropsAsync(int farmerId);
        Task<bool> CanPurchaseBeReviewedAsync(int purchaseId, int dealerId);
        Task<double> GetAverageRatingForCropAsync(int cropId);
        Task<int> GetTotalReviewsForCropAsync(int cropId);
    }
}