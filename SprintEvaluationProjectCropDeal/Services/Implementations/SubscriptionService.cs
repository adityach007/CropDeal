using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Repositories.Interfaces;
using SprintEvaluationProjectCropDeal.Services.Interfaces;

namespace SprintEvaluationProjectCropDeal.Services.Implementations
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly ISubscriptionRepository _subscriptionRepository;
        private readonly IFarmerRepository _farmerRepository;

        public SubscriptionService(
            ISubscriptionRepository subscriptionRepository,
            IFarmerRepository farmerRepository)
        {
            _subscriptionRepository = subscriptionRepository;
            _farmerRepository = farmerRepository;
        }

        public async Task<bool> SubscribeAsync(int dealerId, int farmerId)
        {
            try
            {
                // Check if already subscribed
                if (await _subscriptionRepository.IsSubscribedAsync(dealerId, farmerId))
                    return false;

                var subscription = new FarmerSubscription
                {
                    DealerId = dealerId,
                    FarmerId = farmerId,
                    SubscribedAt = DateTime.UtcNow,
                    IsActive = true
                };

                await _subscriptionRepository.AddSubscriptionAsync(subscription);
                await _subscriptionRepository.SaveChangesAsync();

                // Update farmer's subscriber count
                var farmer = await _farmerRepository.GetByIdAsync(farmerId);
                if (farmer != null)
                {
                    farmer.SubscriberCount++;
                    await _farmerRepository.UpdateAsync(farmer);
                }

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> UnsubscribeAsync(int dealerId, int farmerId)
        {
            try
            {
                var subscription = await _subscriptionRepository.GetSubscriptionAsync(dealerId, farmerId);
                if (subscription == null)
                    return false;

                await _subscriptionRepository.RemoveSubscriptionAsync(subscription);
                await _subscriptionRepository.SaveChangesAsync();

                // Update farmer's subscriber count
                var farmer = await _farmerRepository.GetByIdAsync(farmerId);
                if (farmer != null && farmer.SubscriberCount > 0)
                {
                    farmer.SubscriberCount--;
                    await _farmerRepository.UpdateAsync(farmer);
                }

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<IEnumerable<FarmerSubscription>> GetDealerSubscriptionsAsync(int dealerId)
        {
            return await _subscriptionRepository.GetDealerSubscriptionsAsync(dealerId);
        }

        public async Task<IEnumerable<FarmerSubscription>> GetFarmerSubscribersAsync(int farmerId)
        {
            return await _subscriptionRepository.GetFarmerSubscribersAsync(farmerId);
        }

        public async Task<bool> IsSubscribedAsync(int dealerId, int farmerId)
        {
            return await _subscriptionRepository.IsSubscribedAsync(dealerId, farmerId);
        }
    }
}