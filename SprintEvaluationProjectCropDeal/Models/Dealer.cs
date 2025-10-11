using System.ComponentModel.DataAnnotations;
namespace SprintEvaluationProjectCropDeal.Models;

public class Dealer
{
    // Primary Key
    [Key]
    public int DealerId { get; set; }

    [Required(ErrorMessage = "Please enter the dealer name")]
    [MaxLength(40)]
    public string DealerName { get; set; }

    [Required(ErrorMessage = "Password is required")]
    public string Password { get; set; } = string.Empty;

    [Required]
    [MaxLength(10)]
    public string DealerPhoneNumber { get; set; }

    [Required]
    [EmailAddress]
    public string DealerEmailAddress { get; set; }

    [Required]
    [MaxLength(10)]
    public string DealerAadharNumber { get; set; }

    public string DealerBankAccount { get; set; }

    public string DealerIFSCode { get; set; }

    public string DealerLocation { get; set; }

    [Required]
    public bool IsDealerIdActive { get; set; } = true;

    public virtual ICollection<FarmerSubscription> SubscribedFarmers { get; set; } = new List<FarmerSubscription>();
}