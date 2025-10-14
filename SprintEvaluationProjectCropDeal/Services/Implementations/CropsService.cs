using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Repositories.Interfaces;
using SprintEvaluationProjectCropDeal.Services.Interfaces;

namespace SprintEvaluationProjectCropDeal.Services.Implementations;

public class CropsService : ICropsService
{
    private readonly ICropsRepository _cropsRepository;
    private readonly IEmailService _emailService;
    private readonly IFarmerRepository _farmerRepository;

    public CropsService(
        ICropsRepository cropsRepository,
        IEmailService emailService,
        IFarmerRepository farmerRepository)
    {
        _cropsRepository = cropsRepository;
        _emailService = emailService;
        _farmerRepository = farmerRepository;
    }

    public async Task<IEnumerable<Crops>> GetAllCropsAsync()
    {
        return await _cropsRepository.GetAllAsync();
    }

    public async Task<Crops?> GetCropByIdAsync(int id)
    {
        return await _cropsRepository.GetByIdAsync(id);
    }

    public async Task<bool> CreateCropAsync(Crops crop)
    {
        if (string.IsNullOrWhiteSpace(crop.CropName))
        {
            return false;
        }
        
        await _cropsRepository.AddAsync(crop);
        
        // Send email notification to farmer
        try
        {
            var farmer = await _farmerRepository.GetByIdAsync(crop.FarmerId);
            if (farmer != null && !string.IsNullOrEmpty(farmer.EmailAddressFarmer))
            {
                await _emailService.SendCropListingConfirmationAsync(
                    farmer.EmailAddressFarmer,
                    farmer.FarmerName,
                    crop.CropName,
                    crop.QuantityInKg,
                    crop.PricePerUnit
                );
            }
        }
        catch (Exception)
        {
            // Log error but don't fail crop creation if email fails
            // Email failure should not block the main operation
        }
        
        return true;
    }

    public async Task<bool> UpdateCropAsync(Crops crop)
    {
        if (string.IsNullOrWhiteSpace(crop.CropName))
        {
            return false;
        }

        await _cropsRepository.UpdateAsync(crop);
        
        // Send email notification to farmer about update
        try
        {
            var farmer = await _farmerRepository.GetByIdAsync(crop.FarmerId);
            if (farmer != null && !string.IsNullOrEmpty(farmer.EmailAddressFarmer))
            {
                await _emailService.SendCropUpdateNotificationAsync(
                    farmer.EmailAddressFarmer,
                    farmer.FarmerName,
                    crop.CropName,
                    crop.QuantityInKg,
                    crop.PricePerUnit
                );
            }
        }
        catch (Exception)
        {
            // Log error but don't fail crop update if email fails
        }
        
        return true;
    }


    public async Task<bool> DeleteCropAsync(int id)
    {
        var crop = await _cropsRepository.GetByIdAsync(id);
        if (crop == null)
        {
            return false;
        }

        // Get farmer details before deleting crop
        var farmer = await _farmerRepository.GetByIdAsync(crop.FarmerId);
        var cropName = crop.CropName;

        await _cropsRepository.DeleteAsync(crop);
        
        // Send email notification to farmer about deletion
        try
        {
            if (farmer != null && !string.IsNullOrEmpty(farmer.EmailAddressFarmer))
            {
                await _emailService.SendCropDeletionNotificationAsync(
                    farmer.EmailAddressFarmer,
                    farmer.FarmerName,
                    cropName
                );
            }
        }
        catch (Exception)
        {
            // Log error but don't fail crop deletion if email fails
        }
        
        return true;
    }

    public async Task<IEnumerable<Crops>> GetCropsByFarmerIdAsync(int farmerId)
    {
        var allCrops = await _cropsRepository.GetAllAsync();
        return allCrops.Where(c => c.FarmerId == farmerId);
    }

    public async Task<Crops?> GetCropByIdAsNoTrackingAsync(int id)
    {
        return await _cropsRepository.GetByIdAsNoTrackingAsync(id);
    }
}