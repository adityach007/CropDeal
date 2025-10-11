using System.ComponentModel.DataAnnotations;

namespace SprintEvaluationProjectCropDeal.Models.DTOs.Payment;

public class UpdatePaymentStatusRequest
{
    [Required]
    [StringLength(50)]
    public string Status { get; set; } = string.Empty;
}

public class SubmitReviewRequest
{
    [Required]
    [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
    public int Rating { get; set; }

    [MaxLength(500, ErrorMessage = "Review text cannot exceed 500 characters")]
    public string? ReviewText { get; set; }
}

public class SubscribeToFarmerRequest
{
    [Required]
    public int FarmerId { get; set; }
}

public class FarmerSubscriptionResponse
{
    public int FarmerId { get; set; }
    public string FarmerName { get; set; } = string.Empty;
    public string FarmerLocation { get; set; } = string.Empty;
    public DateTime SubscribedAt { get; set; }
    public int TotalCrops { get; set; }
    public int SubscriberCount { get; set; }
}