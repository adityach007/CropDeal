using System.ComponentModel.DataAnnotations;
namespace SprintEvaluationProjectCropDeal.Models;

public class Admin
{
    // Primary Key
    [Key]
    public int AdminId { get; set; }

    [Required(ErrorMessage = "Please enter the admin name : ")]
    [MaxLength(40)]
    public string AdminName { get; set; }

    [Required]
    [MinLength(6)]
    public string Password { get; set; }

    [Required]
    [MaxLength(10)]
    public string AdminPhoneNumber { get; set; }

    [Required]
    [EmailAddress]
    public string AdminEmailAddress { get; set; }

    [Required]
    [MaxLength(10)]
    public string AdminAadharNumber { get; set; }

    public string AdminIFSCCode { get; set; }
    public string AdminBankAccount { get; set; }

    [Required]
    public bool IsAdminIdActive { get; set; } = true;
}