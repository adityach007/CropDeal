using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Models.DTOs.Payment;

namespace SprintEvaluationProjectCropDeal.Services.Interfaces;

public interface IPaymentService
{
    Task<IEnumerable<Payment>> GetAllAsync();
    Task<Payment?> GetByIdAsync(int id);
    Task AddAsync(Payment payment);
    Task UpdateAsync(Payment payment);
    Task DeleteAsync(int id);
    Task<StripePaymentResponse> CreateStripePaymentIntentAsync(int purchaseId);
    Task<bool> HandleStripeWebhookAsync(string json, string signature);
}