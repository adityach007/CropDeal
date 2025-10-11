using SprintEvaluationProjectCropDeal.Models;

namespace SprintEvaluationProjectCropDeal.Repositories.Interfaces
{
    public interface IDealerRepository
    {
        Task<IEnumerable<Dealer>> GetAllAsync();
        Task<Dealer?> GetByIdAsync(int id);
        Task<Dealer?> GetByEmailAsync(string email);
        Task AddAsync(Dealer dealer);
        Task UpdateAsync(Dealer dealer);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<Dealer?> GetByAadharAsync(string aadharNumber);
        Task<Dealer?> GetByPhoneAsync(string phoneNumber);

        Task<FarmerSubscription?> GetSubscriptionAsync(int dealerId, int farmerId);
    Task<FarmerSubscription?> GetActiveSubscriptionAsync(int dealerId, int farmerId);
    Task AddSubscriptionAsync(FarmerSubscription subscription);
    Task UpdateSubscriptionAsync(FarmerSubscription subscription);
    Task<IEnumerable<FarmerSubscription>> GetSubscribedFarmersAsync(int dealerId);
    Task<int> GetSubscriptionCountAsync(int farmerId);
    Task UpdateFarmerSubscriberCountAsync(int farmerId, int count);
    }
}