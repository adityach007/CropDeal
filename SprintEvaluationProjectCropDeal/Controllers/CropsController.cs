using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Models.DTOs;
using SprintEvaluationProjectCropDeal.Models.DTOs.Crops;
using SprintEvaluationProjectCropDeal.Services.Interfaces;
using IAuthService = SprintEvaluationProjectCropDeal.Services.Interfaces.IAuthorizationService;

namespace SprintEvaluationProjectCropDeal.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CropsController : ControllerBase
{
    private readonly ICropsService _cropsService;
    private readonly ILogger<CropsController> _logger;
    private readonly IAuthService _authorizationService;

    public CropsController(ICropsService cropsService, ILogger<CropsController> logger, IAuthService authorizationService)
    {
        _cropsService = cropsService;
        _logger = logger;
        _authorizationService = authorizationService;
    }

    [HttpGet("all-crops-by-id/{id}")]
    [Authorize(Policy = "AdminOrDealer")]
    public async Task<ActionResult<Crops>> GetById(int id)
    {
        try
        {
            var crop = await _cropsService.GetCropByIdAsync(id);
            if (crop == null) return NotFound();
            return Ok(crop);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting crop by id {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("crops-details-farmer")]
    [Authorize(Policy = "FarmerOnly")]
    public async Task<ActionResult> Create(Crops crop)
    {
        try
        {
            var userId = _authorizationService.GetCurrentUserId(User);
            if (!userId.HasValue) return BadRequest("Invalid token");

            // Ensure farmer can only create crops for themselves
            crop.FarmerId = userId.Value;

            var success = await _cropsService.CreateCropAsync(crop);
            if (!success) return BadRequest("Invalid data");
            
            return CreatedAtAction(nameof(GetById), new { id = crop.CropId }, crop);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating crop");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("crop-details-update-by-id/{id}")]
    [Authorize(Policy = "FarmerOnly")]
    public async Task<ActionResult> Update(int id, UpdateCropDto cropDto)
    {
        try
        {
            if (id != cropDto.CropId) return BadRequest("ID mismatch");

            var existingCrop = await _cropsService.GetCropByIdAsNoTrackingAsync(id);
            if (existingCrop == null) return NotFound();

            // Check if user can modify this crop
            if (!_authorizationService.CanAccessFarmer(User, existingCrop.FarmerId))
            {
                return Forbid("You can only modify your own crops");
            }

            // Map DTO to entity
            var crop = new Crops
            {
                CropId = cropDto.CropId,
                CropName = cropDto.CropName,
                CropType = cropDto.CropType,
                QuantityInKg = cropDto.QuantityInKg,
                PricePerUnit = cropDto.PricePerUnit,
                Location = cropDto.Location,
                // Preserve the FarmerId from existing crop
                FarmerId = existingCrop.FarmerId
            };

            var success = await _cropsService.UpdateCropAsync(crop);
            if (!success) return BadRequest("Invalid data");
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating crop {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("crops-delete-by-id/{id}")]
    [Authorize(Policy ="FarmerOnly")]
    public async Task<ActionResult> Delete(int id)
    {
        try
        {
            var crop = await _cropsService.GetCropByIdAsync(id);
            if (crop == null) return NotFound();

            // Check if user can delete this crop
            if (!_authorizationService.CanAccessFarmer(User, crop.FarmerId))
            {
                return Forbid("You can only delete your own crops");
            }

            await _cropsService.DeleteCropAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting crop {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }


    [HttpGet("current-farmer-crops")]
    [Authorize(Policy = "FarmerOnly")]
    public async Task<ActionResult<IEnumerable<Crops>>> GetMyCrops()
    {
        try
        {
            var userId = _authorizationService.GetCurrentUserId(User);
            if (!userId.HasValue) return BadRequest("Invalid token");

            var crops = await _cropsService.GetCropsByFarmerIdAsync(userId.Value);
            return Ok(crops);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting farmer's crops");
            return StatusCode(500, "Internal server error");
        }
    }
}