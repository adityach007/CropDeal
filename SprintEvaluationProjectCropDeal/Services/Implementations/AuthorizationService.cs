using System.Security.Claims;
using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Services.Interfaces;

namespace SprintEvaluationProjectCropDeal.Services.Implementations
{
    public class AuthorizationService : IAuthorizationService
    {
        // Existing methods
        public bool CanAccessFarmer(ClaimsPrincipal user, int farmerId)
        {
            var userRole = GetCurrentUserRole(user);
            var userId = GetCurrentUserId(user);
            
            if (userRole == "Admin") return true;
            if (userRole == "Farmer" && userId == farmerId) return true;
            
            return false;
        }

        public bool CanAccessDealer(ClaimsPrincipal user, int dealerId)
        {
            var userRole = GetCurrentUserRole(user);
            var userId = GetCurrentUserId(user);
            
            if (userRole == "Admin") return true;
            if (userRole == "Dealer" && userId == dealerId) return true;
            
            return false;
        }

        public bool IsAdmin(ClaimsPrincipal user)
        {
            return GetCurrentUserRole(user) == "Admin";
        }

        public int? GetCurrentUserId(ClaimsPrincipal user)
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? 
                             user.FindFirst("userId")?.Value;
            
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }

        public string GetCurrentUserRole(ClaimsPrincipal user)
        {
            return user.FindFirst(ClaimTypes.Role)?.Value ?? 
                   user.FindFirst("role")?.Value ?? string.Empty;
        }

        // Interface required methods - implement as needed
        public async Task<bool> IsAuthorizedAsync(int userId, string role)
        {
            // Implement based on your business logic
            return await Task.FromResult(true); // Placeholder
        }

        public async Task<bool> CanAccessResourceAsync(int userId, int resourceId, string resourceType)
        {
            // Implement based on your business logic
            return await Task.FromResult(true); // Placeholder
        }

        public async Task<User?> GetCurrentUserAsync(int userId)
        {
            // Implement based on your business logic
            return await Task.FromResult<User?>(null); // Placeholder
        }

        public async Task<bool> HasPermissionAsync(int userId, string permission)
        {
            // Implement based on your business logic
            return await Task.FromResult(true); // Placeholder
        }

        public async Task<bool> IsOwnerAsync(int userId, int resourceOwnerId)
        {
            return await Task.FromResult(userId == resourceOwnerId);
        }
    }
}