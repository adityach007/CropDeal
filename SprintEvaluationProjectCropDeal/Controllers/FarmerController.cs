using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Services;
using SprintEvaluationProjectCropDeal.Services.Interfaces;
using IAuthService = SprintEvaluationProjectCropDeal.Services.Interfaces.IAuthorizationService;

namespace SprintEvaluationProjectCropDeal.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FarmerController : ControllerBase
{
    private readonly IFarmerService _farmerService;
    private readonly ILogger<FarmerController> _logger;
    private readonly IAuthService _authorizationService;

    public FarmerController(IFarmerService farmerService, ILogger<FarmerController> logger, IAuthService authorizationService)
    {
        _farmerService = farmerService;
        _logger = logger;
        _authorizationService = authorizationService;
    }

    [HttpGet("all-farmers-admin")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<IEnumerable<Farmer>>> GetAll()
    {
        try
        {
            var farmers = await _farmerService.GetAllFarmersAsync();
            return Ok(farmers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all farmers");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("farmers-by-id-admin/{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<Farmer>> GetById(int id)
    {
        try
        {
            if (!_authorizationService.CanAccessFarmer(User, id))
            {
                return Forbid("You can only access your own data");
            }

            var farmer = await _farmerService.GetFarmerByIdAsync(id);
            if (farmer == null) return NotFound();
            return Ok(farmer);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting farmer by id {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }


    [HttpPut("farmers-details-update-admin/{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> Update(int id, Farmer farmer)
    {
        try
        {
            if (id != farmer.FarmerId) return BadRequest("ID mismatch");

            var existingFarmer = await _farmerService.GetFarmerByIdAsync(id);
            if (existingFarmer == null) return NotFound();

            // Preserve password - admin cannot change it
            farmer.Password = existingFarmer.Password;

            var success = await _farmerService.UpdateFarmerAsync(farmer);
            if (!success) return BadRequest("Invalid data");
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating farmer {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("farmers-delete-admin/{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> Delete(int id)
    {
        try
        {
            if (!_authorizationService.CanAccessFarmer(User, id))
            {
                return Forbid("You can only delete your own account");
            }

            await _farmerService.DeleteFarmerAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting farmer {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("current-farmer-details/profile")]
    [Authorize(Policy = "FarmerOnly")]
    public async Task<ActionResult<Farmer>> GetMyProfile()
    {
        try
        {
            _logger.LogInformation("GetMyProfile called");
            _logger.LogInformation("User Claims: {Claims}", User.Claims.Select(c => $"{c.Type}: {c.Value}"));
            _logger.LogInformation("User Identity: {Identity}", User.Identity?.IsAuthenticated ?? false);
            _logger.LogInformation("User Roles: {Roles}", User.IsInRole("Farmer"));

            var userId = _authorizationService.GetCurrentUserId(User);
            _logger.LogInformation("User ID from token: {UserId}", userId);

            if (!userId.HasValue) 
            {
                _logger.LogWarning("Invalid token - no user ID found");
                return BadRequest("Invalid token");
            }

            var farmer = await _farmerService.GetFarmerByIdAsync(userId.Value);
            if (farmer == null)
            {
                _logger.LogWarning("Farmer not found for ID: {UserId}", userId.Value);
                return NotFound();
            }
            
            _logger.LogInformation("Farmer found: {FarmerId}", farmer.FarmerId);
            return Ok(farmer);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting farmer profile");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("current-farmer-details-update/profile")]
    [Authorize(Policy = "FarmerOnly")]
    public async Task<ActionResult> UpdateMyProfile(Farmer farmer)
    {
        try
        {
            var userId = _authorizationService.GetCurrentUserId(User);
            if (!userId.HasValue) return BadRequest("Invalid token");

            if (farmer.FarmerId != userId.Value)
            {
                return BadRequest("You can only update your own profile");
            }

            var success = await _farmerService.UpdateFarmerAsync(farmer);
            if (!success) return BadRequest("Invalid data");
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating farmer profile");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("all-farmers")]
    [Authorize(Policy = "AdminOrDealer")]
    public async Task<ActionResult<IEnumerable<Farmer>>> GetAllFarmersForDealer()
    {
        try
        {
            var farmers = await _farmerService.GetAllFarmersAsync();
            return Ok(farmers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all farmers");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("public/all-farmers")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<Farmer>>> GetAllFarmersPublic()
    {
        try
        {
            var farmers = await _farmerService.GetAllFarmersAsync();
            return Ok(farmers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all farmers");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("verify-farmer-admin/{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> ToggleVerification(int id)
    {
        try
        {
            var farmer = await _farmerService.GetFarmerByIdAsync(id);
            if (farmer == null) return NotFound();
            
            farmer.IsVerified = !farmer.IsVerified;
            var success = await _farmerService.UpdateFarmerAsync(farmer);
            if (!success) return BadRequest("Failed to update verification status");
            
            return Ok(new { IsVerified = farmer.IsVerified });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error toggling verification for farmer {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}
