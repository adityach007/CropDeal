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
            
            if (!_authorizationService.CanAccessFarmer(User, id))
            {
                return Forbid("You can only modify your own data");
            }

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
            var userId = _authorizationService.GetCurrentUserId(User);
            if (!userId.HasValue) return BadRequest("Invalid token");

            var farmer = await _farmerService.GetFarmerByIdAsync(userId.Value);
            if (farmer == null) return NotFound();
            
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
}