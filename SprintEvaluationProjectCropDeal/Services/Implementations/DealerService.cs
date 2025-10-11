using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Models.DTOs.Payment; // ADD THIS LINE
using SprintEvaluationProjectCropDeal.Repositories.Interfaces;
using SprintEvaluationProjectCropDeal.Services.Interfaces;

namespace SprintEvaluationProjectCropDeal.Services.Implementations;

public class DealerService : IDealerService
{
    private readonly IDealerRepository _dealerRepository;

    public DealerService(IDealerRepository dealerRepository)
    {
        _dealerRepository = dealerRepository;
    }

    public async Task<IEnumerable<Dealer>> GetAllDealersAsync()
    {
        return await _dealerRepository.GetAllAsync();
    }

    public async Task<Dealer?> GetDealerByIdAsync(int id)
    {
        return await _dealerRepository.GetByIdAsync(id);
    }

    public async Task<Dealer?> GetByEmailAsync(string email)
    {
        return await _dealerRepository.GetByEmailAsync(email);
    }

    public async Task<Dealer?> GetByAadharAsync(string aadharNumber)
    {
        return await _dealerRepository.GetByAadharAsync(aadharNumber);
    }

    public async Task<Dealer?> GetByPhoneAsync(string phoneNumber)
    {
        return await _dealerRepository.GetByPhoneAsync(phoneNumber);
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _dealerRepository.ExistsAsync(id);
    }

    public async Task<bool> CreateDealerAsync(Dealer dealer)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dealer.DealerName))
            {
                return false;
            }

            // Check if dealer with same email already exists
            var existingDealerByEmail = await _dealerRepository.GetByEmailAsync(dealer.DealerEmailAddress);
            if (existingDealerByEmail != null)
            {
                return false;
            }

            // Check if dealer with same Aadhar already exists
            var existingDealerByAadhar = await _dealerRepository.GetByAadharAsync(dealer.DealerAadharNumber);
            if (existingDealerByAadhar != null)
            {
                return false;
            }

            await _dealerRepository.AddAsync(dealer);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task AddAsync(Dealer dealer)
    {
        try
        {
            if (dealer == null)
                throw new ArgumentNullException(nameof(dealer));

            if (string.IsNullOrWhiteSpace(dealer.DealerName))
                throw new ArgumentException("Dealer name is required");

            await _dealerRepository.AddAsync(dealer);
        }
        catch
        {
            throw;
        }
    }

    public async Task<bool> UpdateDealerAsync(Dealer dealer)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dealer.DealerName))
            {
                return false;
            }

            // Check if dealer exists
            var existingDealer = await _dealerRepository.GetByIdAsync(dealer.DealerId);
            if (existingDealer == null)
            {
                return false;
            }

            // Check if email is being changed and if new email already exists for another dealer
            if (existingDealer.DealerEmailAddress != dealer.DealerEmailAddress)
            {
                var dealerWithSameEmail = await _dealerRepository.GetByEmailAsync(dealer.DealerEmailAddress);
                if (dealerWithSameEmail != null && dealerWithSameEmail.DealerId != dealer.DealerId)
                {
                    return false;
                }
            }

            // Check if Aadhar is being changed and if new Aadhar already exists for another dealer
            if (existingDealer.DealerAadharNumber != dealer.DealerAadharNumber)
            {
                var dealerWithSameAadhar = await _dealerRepository.GetByAadharAsync(dealer.DealerAadharNumber);
                if (dealerWithSameAadhar != null && dealerWithSameAadhar.DealerId != dealer.DealerId)
                {
                    return false;
                }
            }

            await _dealerRepository.UpdateAsync(dealer);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> DeleteDealerAsync(int id)
    {
        try
        {
            // Check if dealer exists
            var dealer = await _dealerRepository.GetByIdAsync(id);
            if (dealer == null)
            {
                return false;
            }

            await _dealerRepository.DeleteAsync(id);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> SubscribeToFarmerAsync(int dealerId, int farmerId)
    {
        try
        {
            // Check if already subscribed
            var existingSubscription = await _dealerRepository.GetSubscriptionAsync(dealerId, farmerId);
                
            if (existingSubscription != null)
            {
                if (!existingSubscription.IsActive)
                {
                    existingSubscription.IsActive = true;
                    existingSubscription.SubscribedAt = DateTime.UtcNow;
                    await _dealerRepository.UpdateSubscriptionAsync(existingSubscription);
                }
                else
                {
                    return false; // Already subscribed
                }
            }
            else
            {
                var subscription = new FarmerSubscription
                {
                    DealerId = dealerId,
                    FarmerId = farmerId,
                    SubscribedAt = DateTime.UtcNow,
                    IsActive = true
                };
                
                await _dealerRepository.AddSubscriptionAsync(subscription);
            }
            
            // Update farmer's subscriber count
            await UpdateFarmerSubscriberCount(farmerId);
            return true;
        }
        catch (Exception ex)
        {
            return false;
        }
    }

    public async Task<bool> UnsubscribeFromFarmerAsync(int dealerId, int farmerId)
    {
        try
        {
            var subscription = await _dealerRepository.GetActiveSubscriptionAsync(dealerId, farmerId);
                
            if (subscription == null) return false;
            
            subscription.IsActive = false;
            await _dealerRepository.UpdateSubscriptionAsync(subscription);
            
            // Update farmer's subscriber count
            await UpdateFarmerSubscriberCount(farmerId);
            return true;
        }
        catch (Exception ex)
        {
            return false;
        }
    }

    public async Task<bool> IsSubscribedToFarmerAsync(int dealerId, int farmerId)
    {
        try
        {
            var subscription = await _dealerRepository.GetActiveSubscriptionAsync(dealerId, farmerId);
            return subscription != null;
        }
        catch (Exception ex)
        {
            return false;
        }
    }

    public async Task<IEnumerable<FarmerSubscriptionResponse>> GetSubscribedFarmersAsync(int dealerId)
    {
        try
        {
            var subscriptions = await _dealerRepository.GetSubscribedFarmersAsync(dealerId);
            return subscriptions.Select(sub => new FarmerSubscriptionResponse
            {
                FarmerId = sub.FarmerId,
                FarmerName = sub.Farmer.FarmerName,
                FarmerLocation = sub.Farmer.FarmerLocation,
                SubscribedAt = sub.SubscribedAt,
                TotalCrops = sub.Farmer.Crops?.Count ?? 0,
                SubscriberCount = sub.Farmer.SubscriberCount
            });
        }
        catch (Exception ex)
        {
            return Enumerable.Empty<FarmerSubscriptionResponse>();
        }
    }

    public async Task<int> GetSubscriptionCountForFarmerAsync(int farmerId)
    {
        try
        {
            return await _dealerRepository.GetSubscriptionCountAsync(farmerId);
        }
        catch (Exception ex)
        {
            return 0;
        }
    }

    private async Task UpdateFarmerSubscriberCount(int farmerId)
    {
        var count = await GetSubscriptionCountForFarmerAsync(farmerId);
        await _dealerRepository.UpdateFarmerSubscriberCountAsync(farmerId, count);
    }
}