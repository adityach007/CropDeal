using SprintEvaluationProjectCropDeal.Models;

namespace SprintEvaluationProjectCropDeal.Services.Interfaces;

public interface IAdminService
{
    Task<IEnumerable<Admin>> GetAllAsync();
    Task<Admin?> GetByIdAsync(int id);
    Task<Admin?> GetByEmailAsync(string email);
    Task AddAsync(Admin admin);
    Task UpdateAsync(Admin admin);
    Task DeleteAsync(int id);
}