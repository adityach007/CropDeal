using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Models.DTOs.Payment; // ADD THIS LINE

namespace SprintEvaluationProjectCropDeal.Services.Interfaces;

public interface IDealerService
{
    Task<IEnumerable<Dealer>> GetAllDealersAsync();
    Task<Dealer?> GetDealerByIdAsync(int id);
    Task<Dealer?> GetByEmailAsync(string email);
    Task<bool> CreateDealerAsync(Dealer dealer);
    Task<bool> UpdateDealerAsync(Dealer dealer);
    Task<bool> DeleteDealerAsync(int id);
    Task AddAsync(Dealer dealer); // Used by AuthController
    Task<bool> ExistsAsync(int id);
    Task<Dealer?> GetByAadharAsync(string aadharNumber);
    Task<Dealer?> GetByPhoneAsync(string phoneNumber);

    Task<bool> SubscribeToFarmerAsync(int dealerId, int farmerId);
    Task<bool> UnsubscribeFromFarmerAsync(int dealerId, int farmerId);
    Task<bool> IsSubscribedToFarmerAsync(int dealerId, int farmerId);
    Task<IEnumerable<FarmerSubscriptionResponse>> GetSubscribedFarmersAsync(int dealerId);
    Task<int> GetSubscriptionCountForFarmerAsync(int farmerId);
}