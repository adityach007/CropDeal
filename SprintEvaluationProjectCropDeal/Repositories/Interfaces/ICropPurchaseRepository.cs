using SprintEvaluationProjectCropDeal.Models;

namespace SprintEvaluationProjectCropDeal.Repositories.Interfaces
{
    public interface ICropPurchaseRepository
    {
        Task<IEnumerable<CropPurchase>> GetAllAsync();
        Task<CropPurchase?> GetByIdAsync(int id);
        Task<IEnumerable<CropPurchase>> GetByDealerIdAsync(int dealerId);
        Task<IEnumerable<CropPurchase>> GetByCropIdAsync(int cropId);
        Task AddAsync(CropPurchase purchase);
        Task UpdateAsync(CropPurchase purchase);
        Task DeleteAsync(int id);
        Task<bool> ConfirmPurchaseAndUpdateCropAsync(int purchaseId);
        Task<IEnumerable<CropPurchase>> GetConfirmedPurchasesAsync();
        Task<IEnumerable<CropPurchase>> GetPendingPurchasesAsync();
        Task<IEnumerable<CropPurchase>> GetReviewedPurchasesByCropIdAsync(int cropId);
    }
}