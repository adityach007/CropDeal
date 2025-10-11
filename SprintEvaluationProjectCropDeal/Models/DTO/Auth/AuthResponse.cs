using SprintEvaluationProjectCropDeal.Models;

namespace SprintEvaluationProjectCropDeal.Models.DTOs.Auth
{
    public class AuthResponse
    {
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public UserType UserType { get; set; }
        public string Token { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}