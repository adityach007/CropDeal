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
public class CropPurchaseController : ControllerBase
{
    private readonly ICropPurchaseService _cropPurchaseService;
    private readonly ILogger<CropPurchaseController> _logger;
    private readonly IAuthService _authorizationService;

    public CropPurchaseController(
        ICropPurchaseService cropPurchaseService, 
        ILogger<CropPurchaseController> logger, 
        IAuthService authorizationService)
    {
        _cropPurchaseService = cropPurchaseService;
        _logger = logger;
        _authorizationService = authorizationService;
    }

    // [HttpGet]
    // [Authorize(Policy = "AdminOnly")]
    // public async Task<ActionResult<IEnumerable<CropPurchase>>> GetAll()
    // {
    //     try
    //     {
    //         var purchases = await _cropPurchaseService.GetAllCropPurchasesAsync();
    //         return Ok(purchases);
    //     }
    //     catch (Exception ex)
    //     {
    //         _logger.LogError(ex, "Error getting all crop purchases");
    //         return StatusCode(500, "Internal server error");
    //     }
    // }

    [HttpPut("crop-details-update-admin/{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> Update(int id, CropPurchase purchase)
    {
        try
        {
            if (id != purchase.PurchaseId) 
                return BadRequest("ID mismatch");

            var existingPurchase = await _cropPurchaseService.GetCropPurchaseByIdAsync(id);
            if (existingPurchase == null) 
                return NotFound();

            var userRole = _authorizationService.GetCurrentUserRole(User);
            var userId = _authorizationService.GetCurrentUserId(User);

            if (!_authorizationService.IsAdmin(User))
            {
                if (userRole == "Dealer" && existingPurchase.DealerId != userId)
                    return Forbid("You can only modify your own purchases");
            }

            var success = await _cropPurchaseService.UpdateCropPurchaseAsync(purchase);
            if (!success) 
                return BadRequest("Invalid data");
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating crop purchase {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("crop-delete-by-id/{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> Delete(int id)
    {
        try
        {
            var purchase = await _cropPurchaseService.GetCropPurchaseByIdAsync(id);
            if (purchase == null) 
                return NotFound();

            var userRole = _authorizationService.GetCurrentUserRole(User);
            var userId = _authorizationService.GetCurrentUserId(User);

            if (!_authorizationService.IsAdmin(User))
            {
                if (userRole == "Dealer" && purchase.DealerId != userId)
                    return Forbid("You can only delete your own purchases");
            }

            await _cropPurchaseService.DeleteCropPurchaseAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting crop purchase {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("crop-request-by-dealer/request")]
    [Authorize(Policy = "DealerOnly")]
    public async Task<ActionResult> CreatePurchaseRequest(CropPurchaseRequest request)
    {
        try
        {
            var userId = _authorizationService.GetCurrentUserId(User);
            if (!userId.HasValue) 
                return BadRequest("Invalid token");

            request.DealerId = userId.Value;

            var success = await _cropPurchaseService.CreatePurchaseRequestAsync(request);
            if (!success) 
                return BadRequest("Failed to create purchase request");

            return Ok(new { Message = "Purchase request created successfully. Farmer has been notified via email." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating purchase request");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("crop-purchase-by-dealer/{id}/confirm")]
    [Authorize(Policy = "FarmerOnly")]
    public async Task<ActionResult> ConfirmPurchase(int id)
    {
        try
        {
            var success = await _cropPurchaseService.ConfirmPurchaseAndUpdateCropAsync(id);
            if (!success) 
                return BadRequest("Failed to confirm purchase");

            return Ok(new { Message = "Purchase confirmed successfully. Dealer has been notified via email." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error confirming purchase {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("by-dealer/{dealerId}")]
    public async Task<ActionResult<IEnumerable<CropPurchase>>> GetByDealerId(int dealerId)
    {
        try
        {
            if (!_authorizationService.CanAccessDealer(User, dealerId))
            {
                return Forbid("You can only access your own purchases");
            }

            var purchases = await _cropPurchaseService.GetPurchasesByDealerIdAsync(dealerId);
            return Ok(purchases);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting purchases for dealer {DealerId}", dealerId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("by-farmer/{farmerId}")]
    public async Task<ActionResult<IEnumerable<CropPurchase>>> GetByFarmerId(int farmerId)
    {
        try
        {
            if (!_authorizationService.CanAccessFarmer(User, farmerId))
            {
                return Forbid("You can only access your own crop purchases");
            }

            var purchases = await _cropPurchaseService.GetPurchasesByFarmerIdAsync(farmerId);
            return Ok(purchases);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting purchases for farmer {FarmerId}", farmerId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("crop-purchased-submit/{purchaseId}/review")]
    [Authorize(Policy = "DealerOnly")]
    public async Task<ActionResult> SubmitReview(int purchaseId, [FromBody] SubmitReviewRequest request)
    {
        try
        {
            var userId = _authorizationService.GetCurrentUserId(User);
            if (!userId.HasValue) 
                return BadRequest("Invalid token");

            var purchase = await _cropPurchaseService.GetCropPurchaseByIdAsync(purchaseId);
            if (purchase == null) 
                return NotFound("Purchase not found");

            if (purchase.DealerId != userId.Value)
                return Forbid("You can only review your own purchases");

            if (!purchase.IsConfirmed)
                return BadRequest("Cannot review unconfirmed purchase");

            if (purchase.HasBeenReviewed)
                return BadRequest("This purchase has already been reviewed");

            purchase.Rating = request.Rating;
            purchase.ReviewText = request.ReviewText;
            purchase.ReviewDate = DateTime.UtcNow;
            purchase.HasBeenReviewed = true;

            var success = await _cropPurchaseService.UpdateCropPurchaseAsync(purchase);
            if (!success) 
                return BadRequest("Failed to submit review");

            return Ok(new { Message = "Review submitted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting review for purchase {PurchaseId}", purchaseId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("crop-purchased-get/{purchaseId}/review")]
    [Authorize(Policy = "FarmerOrDealer")]
    public async Task<ActionResult> GetReview(int purchaseId)
    {
        try
        {
            var purchase = await _cropPurchaseService.GetCropPurchaseByIdAsync(purchaseId);
            if (purchase == null) 
                return NotFound("Purchase not found");

            if (!purchase.HasBeenReviewed)
                return NotFound("No review found for this purchase");

            var reviewData = new
            {
                PurchaseId = purchase.PurchaseId,
                Rating = purchase.Rating,
                ReviewText = purchase.ReviewText,
                ReviewDate = purchase.ReviewDate,
                CropId = purchase.CropId,
                DealerId = purchase.DealerId
            };

            return Ok(reviewData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting review for purchase {PurchaseId}", purchaseId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("reviews/by-crop/{cropId}")]
    [Authorize(Policy = "FarmerOrDealer")]
    public async Task<ActionResult> GetReviewsByCrop(int cropId)
    {
        try
        {
            var purchases = await _cropPurchaseService.GetReviewedPurchasesByCropIdAsync(cropId);

            var reviews = purchases.Where(p => p.HasBeenReviewed).Select(p => new
            {
                PurchaseId = p.PurchaseId,
                Rating = p.Rating,
                ReviewText = p.ReviewText,
                ReviewDate = p.ReviewDate,
                DealerId = p.DealerId
            });

            return Ok(reviews);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting reviews for crop {CropId}", cropId);
            return StatusCode(500, "Internal server error");
        }
    }
    
    
}