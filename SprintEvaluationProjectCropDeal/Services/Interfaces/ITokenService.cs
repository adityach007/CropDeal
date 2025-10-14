namespace SprintEvaluationProjectCropDeal.Services.Interfaces
{
    public interface ITokenService
    {
        string GenerateJwtToken(string email, string role, string userId);
        bool ValidateToken(string token);
    }
}