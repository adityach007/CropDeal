using System.ComponentModel.DataAnnotations;

namespace SprintEvaluationProjectCropDeal.Models.DTOs.Payment;

public class CreateStripePaymentRequest
{
    [Required]
    public int PurchaseId { get; set; }
}

public class StripePaymentResponse
{
    public string ClientSecret { get; set; } = string.Empty;
    public string PaymentIntentId { get; set; } = string.Empty;
    public int PaymentId { get; set; }
    public double Amount { get; set; }
}
