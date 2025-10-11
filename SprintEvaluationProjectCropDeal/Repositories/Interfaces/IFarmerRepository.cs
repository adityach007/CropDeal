using SprintEvaluationProjectCropDeal.Models;

namespace SprintEvaluationProjectCropDeal.Repositories.Interfaces
{
    public interface IFarmerRepository
    {
        Task<IEnumerable<Farmer>> GetAllAsync();
        Task<Farmer?> GetByIdAsync(int id);
        Task<Farmer?> GetByEmailAsync(string email);
        Task AddAsync(Farmer farmer);
        Task UpdateAsync(Farmer farmer);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<Farmer?> GetByAadharAsync(string aadharNumber);
        Task<Farmer?> GetByPhoneAsync(string phoneNumber);
    }
}