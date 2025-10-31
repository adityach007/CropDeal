using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Models.DTOs.Payment;
using SprintEvaluationProjectCropDeal.Services.Interfaces;
using IAuthService = SprintEvaluationProjectCropDeal.Services.Interfaces.IAuthorizationService;

namespace SprintEvaluationProjectCropDeal.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DealerController : ControllerBase
{
    private readonly IDealerService _dealerService;
    private readonly ILogger<DealerController> _logger;
    private readonly IAuthService _authorizationService;
    private readonly ISubscriptionService _subscriptionService;

    public DealerController(IDealerService dealerService, ILogger<DealerController> logger, IAuthService authorizationService, ISubscriptionService subscriptionService)
    {
        _dealerService = dealerService;
        _logger = logger;
        _authorizationService = authorizationService;
        _subscriptionService = subscriptionService;
    }

    [HttpGet("all-dealers-admin")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<IEnumerable<Dealer>>> GetAll()
    {
        try
        {
            var dealers = await _dealerService.GetAllDealersAsync();
            return Ok(dealers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all dealers");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("dealers-by-id-admin/{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<Dealer>> GetById(int id)
    {
        try
        {
            if (!_authorizationService.CanAccessDealer(User, id))
            {
                return Forbid("You can only access your own data");
            }

            var dealer = await _dealerService.GetDealerByIdAsync(id);
            if (dealer == null) return NotFound();
            return Ok(dealer);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting dealer by id {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }


    [HttpPut("dealers-details-update-admin/{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> Update(int id, Dealer dealer)
    {
        try
        {
            if (id != dealer.DealerId) return BadRequest("ID mismatch");

            var existingDealer = await _dealerService.GetDealerByIdAsync(id);
            if (existingDealer == null) return NotFound();

            // Preserve password - admin cannot change it
            dealer.Password = existingDealer.Password;

            var success = await _dealerService.UpdateDealerAsync(dealer);
            if (!success) return BadRequest("Invalid data");
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating dealer {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("dealers-delete-admin/{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> Delete(int id)
    {
        try
        {
            if (!_authorizationService.CanAccessDealer(User, id))
            {
                return Forbid("You can only delete your own account");
            }

            await _dealerService.DeleteDealerAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting dealer {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("current-dealer-details/profile")]
    [Authorize(Policy = "DealerOnly")]
    public async Task<ActionResult<Dealer>> GetMyProfile()
    {
        try
        {
            var userId = _authorizationService.GetCurrentUserId(User);
            if (!userId.HasValue) return BadRequest("Invalid token");

            var dealer = await _dealerService.GetDealerByIdAsync(userId.Value);
            if (dealer == null) return NotFound();
            
            return Ok(dealer);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting dealer profile");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("current-dealer-details-update/profile")]
    [Authorize(Policy = "DealerOnly")]
    public async Task<ActionResult> UpdateMyProfile(Dealer dealer)
    {
        try
        {
            var userId = _authorizationService.GetCurrentUserId(User);
            if (!userId.HasValue) return BadRequest("Invalid token");

            if (dealer.DealerId != userId.Value)
            {
                return BadRequest("You can only update your own profile");
            }

            var success = await _dealerService.UpdateDealerAsync(dealer);
            if (!success) return BadRequest("Invalid data");
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating dealer profile");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("subscribe")]
    [Authorize(Policy = "DealerOnly")]
    public async Task<IActionResult> SubscribeToFarmer([FromBody] SubscribeToFarmerRequest request)
    {
        try
        {
            var userId = _authorizationService.GetCurrentUserId(User);
            if (!userId.HasValue) return BadRequest("Invalid token");

            var success = await _subscriptionService.SubscribeAsync(userId.Value, request.FarmerId);
            
            if (!success)
                return BadRequest("Already subscribed or farmer not found");

            return Ok(new { Message = "Successfully subscribed to farmer" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("unsubscribe/{farmerId}")]
    [Authorize(Policy = "DealerOnly")]
    public async Task<IActionResult> UnsubscribeFromFarmer(int farmerId)
    {
        try
        {
            var userId = _authorizationService.GetCurrentUserId(User);
            if (!userId.HasValue) return BadRequest("Invalid token");

            var success = await _subscriptionService.UnsubscribeAsync(userId.Value, farmerId);
            
            if (!success)
                return BadRequest("Not subscribed to this farmer");

            return Ok(new { Message = "Successfully unsubscribed from farmer" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("subscriptions")]
    [Authorize(Policy = "DealerOnly")]
    public async Task<IActionResult> GetSubscribedFarmers()
    {
        try
        {
            var userId = _authorizationService.GetCurrentUserId(User);
            if (!userId.HasValue) return BadRequest("Invalid token");

            var subscriptions = await _subscriptionService.GetDealerSubscriptionsAsync(userId.Value);
            return Ok(subscriptions);
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("check-subscription/{farmerId}")]
    [Authorize(Policy = "DealerOnly")]
    public async Task<IActionResult> CheckSubscriptionStatus(int farmerId)
    {
        try
        {
            var userId = _authorizationService.GetCurrentUserId(User);
            if (!userId.HasValue) return BadRequest("Invalid token");

            var isSubscribed = await _subscriptionService.IsSubscribedAsync(userId.Value, farmerId);
            return Ok(new { IsSubscribed = isSubscribed });
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Internal server error");
        }
    }
}