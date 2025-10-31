using System.ComponentModel.DataAnnotations;
namespace SprintEvaluationProjectCropDeal.Models;

public class Farmer
{
    // Primary Key
    [Key]
    public int FarmerId { get; set; }

    [Required(ErrorMessage = "Password is required")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Please provide the Farmer's name")]
    [MaxLength(40)]
    public string FarmerName { get; set; }

    [Required]
    [EmailAddress]
    public string EmailAddressFarmer { get; set; }

    [Required]
    [MaxLength(10)]
    public string FarmerPhoneNumber { get; set; }

    [Required]
    [MaxLength(12)]
    public string FarmerAadharNumber { get; set; }

    [MaxLength(20)]
    public string FarmerBankAccount { get; set; }

    [MaxLength(11)]
    public string FarmerIFSCCode { get; set; }

    [Required(ErrorMessage = "Location is required")]
    public string FarmerLocation { get; set; }

    // Used to know whether the particular farmer now exists on the website/portal
    // Default value has been set to true only
    [Required]
    public bool IsFarmerIdActive { get; set; } = true;

    // Used to know whether the farmer is verified by admin
    [Required]
    public bool IsVerified { get; set; } = false;

    // Navigation properties for cascade delete
    public ICollection<Crops> Crops { get; set; }
    public ICollection<Payment> Payments { get; set; }

    public virtual ICollection<FarmerSubscription> Subscribers { get; set; } = new List<FarmerSubscription>();
    public int SubscriberCount { get; set; } = 0;
}
