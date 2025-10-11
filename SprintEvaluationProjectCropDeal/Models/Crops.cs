using System.ComponentModel.DataAnnotations;
using SprintEvaluationProjectCropDeal.Models;

public class Crops
{
    // Primary Key
    [Key]
    public int CropId { get; set; }

    [Required]
    // Whether it is a vegetable or fruit
    public string CropType { get; set; }

    [Required]
    public string CropName { get; set; }

    [Required]
    public int QuantityInKg { get; set; }

    [Required]
    public string Location { get; set; }

    [Required]
    // Foreign Key
    public int FarmerId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
    public int PricePerUnit { get; set; }
}