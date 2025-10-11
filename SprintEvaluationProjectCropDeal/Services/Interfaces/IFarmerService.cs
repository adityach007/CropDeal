using SprintEvaluationProjectCropDeal.Models;

namespace SprintEvaluationProjectCropDeal.Services.Interfaces;

public interface IFarmerService
{
    Task<IEnumerable<Farmer>> GetAllFarmersAsync();
    Task<Farmer?> GetFarmerByIdAsync(int id);
    Task<Farmer?> GetByEmailAsync(string email); // Add this method
    Task<bool> CreateFarmerAsync(Farmer farmer);
    Task<bool> UpdateFarmerAsync(Farmer farmer);
    Task<bool> DeleteFarmerAsync(int id);
    Task AddAsync(Farmer farmer); // Add this method for AuthController
}