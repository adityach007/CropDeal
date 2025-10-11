using System.ComponentModel.DataAnnotations;

namespace SprintEvaluationProjectCropDeal.Models.DTOs.Payment;

public class CreatePaymentFromPurchaseRequest
{
    [Required]
    public int PurchaseId { get; set; }
}

