using System.ComponentModel.DataAnnotations;

namespace SprintEvaluationProjectCropDeal.Models.DTOs.Payment
{
    public class CropPurchaseRequest
    {
        [Required]
        public int DealerId { get; set; }
        
        [Required]
        public int CropId { get; set; }
        
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be greater than 0")]
        public int QuantityRequested { get; set; }
    }
}