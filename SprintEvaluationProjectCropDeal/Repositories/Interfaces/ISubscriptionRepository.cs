using SprintEvaluationProjectCropDeal.Models;

namespace SprintEvaluationProjectCropDeal.Repositories.Interfaces
{
    public interface ISubscriptionRepository
    {
        Task<FarmerSubscription?> GetSubscriptionAsync(int dealerId, int farmerId);
        Task<IEnumerable<FarmerSubscription>> GetDealerSubscriptionsAsync(int dealerId);
        Task<IEnumerable<FarmerSubscription>> GetFarmerSubscribersAsync(int farmerId);
        Task AddSubscriptionAsync(FarmerSubscription subscription);
        Task RemoveSubscriptionAsync(FarmerSubscription subscription);
        Task<bool> IsSubscribedAsync(int dealerId, int farmerId);
        Task SaveChangesAsync();
    }
}