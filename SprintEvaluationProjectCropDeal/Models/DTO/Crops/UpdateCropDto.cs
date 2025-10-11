using System.ComponentModel.DataAnnotations;

namespace SprintEvaluationProjectCropDeal.Models.DTOs.Crops;

public class UpdateCropDto
{
    [Required]
    public int CropId { get; set; }

    [Required]
    [StringLength(100)]
    public string CropName { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string CropType { get; set; } = string.Empty;

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Quantity must be greater than 0")]
    public int QuantityInKg { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
    public int PricePerUnit { get; set; }

    [Required(ErrorMessage = "Location is required")]
    public string Location { get; set; }
}