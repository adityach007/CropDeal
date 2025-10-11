using SprintEvaluationProjectCropDeal.Models;

namespace SprintEvaluationProjectCropDeal.Services.Interfaces;

public interface ICropsService
{
    Task<IEnumerable<Crops>> GetAllCropsAsync();
    Task<Crops?> GetCropByIdAsync(int id); // Changed from GetCropsByIdAsync
    Task<bool> CreateCropAsync(Crops crop); // Changed from CreateCropsAsync
    Task<bool> UpdateCropAsync(Crops crop); // Changed from UpdateCropsAsync
    Task<bool> DeleteCropAsync(int id); // Changed signature
    Task<IEnumerable<Crops>> GetCropsByFarmerIdAsync(int farmerId); // Added missing method
    Task<Crops?> GetCropByIdAsNoTrackingAsync(int id);
}