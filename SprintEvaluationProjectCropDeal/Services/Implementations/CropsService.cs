using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Repositories.Interfaces;
using SprintEvaluationProjectCropDeal.Services.Interfaces;

namespace SprintEvaluationProjectCropDeal.Services.Implementations;

public class CropsService : ICropsService
{
    private readonly ICropsRepository _cropsRepository;

    public CropsService(ICropsRepository cropsRepository)
    {
        _cropsRepository = cropsRepository;
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
        return true;
    }

    public async Task<bool> UpdateCropAsync(Crops crop)
    {
        if (string.IsNullOrWhiteSpace(crop.CropName))
        {
            return false;
        }

        await _cropsRepository.UpdateAsync(crop);
        return true;
    }

    public async Task<bool> DeleteCropAsync(int id)
    {
        var crop = await _cropsRepository.GetByIdAsync(id);
        if (crop == null)
        {
            return false;
        }

        await _cropsRepository.DeleteAsync(crop);
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