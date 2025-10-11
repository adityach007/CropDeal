using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SprintEvaluationProjectCropDeal.Models
{
    public class CropPurchase
    {
        [Key]
        public int PurchaseId { get; set; }

        [Required]
        public int DealerId { get; set; }

        [Required]
        public int CropId { get; set; }

        [Required]
        public int QuantityRequested { get; set; }

        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

        public bool IsConfirmed { get; set; } = false;

        // Navigation properties
        [ForeignKey("DealerId")]
        public virtual Dealer? Dealer { get; set; }

        [ForeignKey("CropId")]
        public virtual Crops? Crop { get; set; }

        // [ForeignKey("FarmerId")]
        // public virtual Farmer? Farmer { get; set; }

        public int? Rating { get; set; } // 1-5 stars, nullable until reviewed
        public string? ReviewText { get; set; }
        public DateTime? ReviewDate { get; set; }
        public bool HasBeenReviewed { get; set; } = false;
    }
}