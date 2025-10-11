using SprintEvaluationProjectCropDeal.Models;
using System.Threading.Tasks;

namespace SprintEvaluationProjectCropDeal.Services.Interfaces
{
    public interface IUserService
    {
        Task<bool> CreateUserAsync(User user);
    }
}