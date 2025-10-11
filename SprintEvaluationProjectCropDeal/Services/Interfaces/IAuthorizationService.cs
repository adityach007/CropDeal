using System.Security.Claims;
using SprintEvaluationProjectCropDeal.Models;

namespace SprintEvaluationProjectCropDeal.Services.Interfaces
{
    public interface IAuthorizationService
    {
        Task<bool> IsAuthorizedAsync(int userId, string role);
        Task<bool> CanAccessResourceAsync(int userId, int resourceId, string resourceType);
        Task<User?> GetCurrentUserAsync(int userId);
        Task<bool> HasPermissionAsync(int userId, string permission);
        Task<bool> IsOwnerAsync(int userId, int resourceOwnerId);
        
        // Add the methods used by controllers
        bool CanAccessFarmer(ClaimsPrincipal user, int farmerId);
        bool CanAccessDealer(ClaimsPrincipal user, int dealerId);
        bool IsAdmin(ClaimsPrincipal user);
        int? GetCurrentUserId(ClaimsPrincipal user);
        string GetCurrentUserRole(ClaimsPrincipal user);
    }
}