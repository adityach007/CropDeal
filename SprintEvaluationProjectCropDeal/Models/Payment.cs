using System.ComponentModel.DataAnnotations;
namespace SprintEvaluationProjectCropDeal.Models;

public class Payment
{
    // Primary Key
    [Key]
    public int PaymentId { get; set; }

    [Required]
    public int FarmerId { get; set; }

    [Required]
    public int DealerId { get; set; }

    [Required]
    public int CropId { get; set; }

    [Required]
    public int PurchaseId { get; set; } // ADD THIS LINE

    public double Amount { get; set; }

    public DateTime TransactionDate { get; set; }

    public string TransactionStatus { get; set; } = "Pending";

    public bool CanBeReviewed { get; set; } = false; // Set to true when payment is "Completed"

    public string? StripePaymentIntentId { get; set; }

    public string? StripeSessionId { get; set; }
}