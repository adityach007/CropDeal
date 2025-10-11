using System.ComponentModel.DataAnnotations;
using SprintEvaluationProjectCropDeal.Models;

namespace SprintEvaluationProjectCropDeal.Models.DTOs.Auth
{
    public class RegisterRequest
    {
        [Required(ErrorMessage = "Please provide the name")]
        [MaxLength(40)]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Please provide a valid email address")]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required")]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Phone number is required")]
        [MaxLength(10)]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "User type is required")]
        public UserType UserType { get; set; }

        [Required(ErrorMessage = "Aadhar number is required")]
        [MaxLength(12)]
        public string AadharNumber { get; set; } = string.Empty;

        // Optional fields - will be used based on UserType
        [MaxLength(20)]
        public string? BankAccount { get; set; }

        [MaxLength(11)]
        public string? IFSCCode { get; set; }

        // Location field - required for Farmer and Dealer
        public string? Location { get; set; }

        // Active status - defaults to true
        public bool IsActive { get; set; } = true;
    }
}