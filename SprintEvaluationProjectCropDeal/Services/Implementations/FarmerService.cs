using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Repositories.Interfaces;
using SprintEvaluationProjectCropDeal.Services.Interfaces;

namespace SprintEvaluationProjectCropDeal.Services.Implementations;

public class FarmerService : IFarmerService
{
    private readonly IFarmerRepository _farmerRepository;

    public FarmerService(IFarmerRepository farmerRepository)
    {
        _farmerRepository = farmerRepository;
    }

    public async Task<IEnumerable<Farmer>> GetAllFarmersAsync()
    {
        return await _farmerRepository.GetAllAsync();
    }

    public async Task<Farmer?> GetFarmerByIdAsync(int id)
    {
        return await _farmerRepository.GetByIdAsync(id);
    }

    public async Task<Farmer?> GetByEmailAsync(string email)
    {
        return await _farmerRepository.GetByEmailAsync(email);
    }

    public async Task<bool> CreateFarmerAsync(Farmer farmer)
    {
        if (string.IsNullOrWhiteSpace(farmer.FarmerName))
        {
            return false;
        }
        await _farmerRepository.AddAsync(farmer);
        return true;
    }

    public async Task AddAsync(Farmer farmer)
    {
        await _farmerRepository.AddAsync(farmer);
    }

    public async Task<bool> UpdateFarmerAsync(Farmer farmer)
    {
        if (string.IsNullOrWhiteSpace(farmer.FarmerName))
            return false;

        await _farmerRepository.UpdateAsync(farmer);
        return true;
    }

    public async Task<bool> DeleteFarmerAsync(int id)
    {
        await _farmerRepository.DeleteAsync(id);
        return true;
    }
}