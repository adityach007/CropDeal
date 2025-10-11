using SprintEvaluationProjectCropDeal.Models;

namespace SprintEvaluationProjectCropDeal.Repositories.Interfaces;

public interface ICropsRepository
{
    Task<IEnumerable<Crops>> GetAllAsync();
    Task<Crops?> GetByIdAsync(int id);
    Task AddAsync(Crops crop);
    Task UpdateAsync(Crops crop);
    Task DeleteAsync(Crops crop);
    Task<Crops?> GetByIdAsNoTrackingAsync(int id);

}