using System.ComponentModel.DataAnnotations;

namespace SprintEvaluationProjectCropDeal.Models;

public enum UserRole
{
    Farmer,
    Dealer,
    Admin
}

public class User
{
    // Primary Key
    [Key]
    public int UserId { get; set; }

    [Required(ErrorMessage = "Please provide the user's name")]
    [MaxLength(40)]
    public string Name { get; set; }

    [Required(ErrorMessage = "Email address is required")]
    [EmailAddress(ErrorMessage = "Invalid email address format")]
    public string Email { get; set; }

    [Required(ErrorMessage = "Password is required")]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters long")]
    public string Password { get; set; }

    [Required(ErrorMessage = "Phone number is required")]
    [MaxLength(10, ErrorMessage = "Phone number cannot exceed 10 digits")]
    [RegularExpression(@"^[0-9]{10}$", ErrorMessage = "Invalid phone number format")]
    public string PhoneNumber { get; set; }

    [Required(ErrorMessage = "Aadhar number is required")]
    [MaxLength(12, ErrorMessage = "Aadhar number cannot exceed 12 digits")]
    [RegularExpression(@"^[0-9]{12}$", ErrorMessage = "Invalid Aadhar number format")]
    public string AadharNumber { get; set; }

    [Required(ErrorMessage = "Role is required")]
    public UserRole Role { get; set; } // Farmer, Dealer, or Admin

    // Used to know whether the user account is active
    [Required]
    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

}