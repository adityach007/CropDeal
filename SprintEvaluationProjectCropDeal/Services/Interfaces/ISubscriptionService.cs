using SprintEvaluationProjectCropDeal.Models;

namespace SprintEvaluationProjectCropDeal.Services.Interfaces
{
    public interface ISubscriptionService
    {
        Task<bool> SubscribeAsync(int dealerId, int farmerId);
        Task<bool> UnsubscribeAsync(int dealerId, int farmerId);
        Task<IEnumerable<FarmerSubscription>> GetDealerSubscriptionsAsync(int dealerId);
        Task<IEnumerable<FarmerSubscription>> GetFarmerSubscribersAsync(int farmerId);
        Task<bool> IsSubscribedAsync(int dealerId, int farmerId);
    }
}