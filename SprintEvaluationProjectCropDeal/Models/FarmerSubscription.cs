using System.ComponentModel.DataAnnotations;

namespace SprintEvaluationProjectCropDeal.Models
{
    public class FarmerSubscription
    {
        [Required]
        public int DealerId { get; set; }
        
        [Required]
        public int FarmerId { get; set; }
        
        public DateTime SubscribedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsActive { get; set; } = true;
        
        // Navigation properties
        public virtual Dealer Dealer { get; set; } = null!;
        public virtual Farmer Farmer { get; set; } = null!;
    }
}