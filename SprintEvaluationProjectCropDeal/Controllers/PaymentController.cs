using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SprintEvaluationProjectCropDeal.Data;
using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Models.DTOs.Payment;
using SprintEvaluationProjectCropDeal.Services.Interfaces;

namespace SprintEvaluationProjectCropDeal.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<PaymentController> _logger;
    private readonly IEmailService _emailService;

    public PaymentController(
        ApplicationDbContext db, 
        ILogger<PaymentController> logger,
        IEmailService emailService)
    {
        _db = db;
        _logger = logger;
        _emailService = emailService;
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "FarmerOrDealer")]
    public async Task<ActionResult<Payment>> GetPaymentById(int id)
    {
        try
        {
            var payment = await _db.PaymentsDetails.FindAsync(id);
            if (payment == null)
                return NotFound("Payment not found");

            return Ok(payment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving payment {PaymentId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("by-crop/{cropId}")]
    [Authorize(Policy = "FarmerOrDealer")]
    public async Task<ActionResult<IEnumerable<Payment>>> GetPaymentsByCropId(int cropId)
    {
        try
        {
            var payments = await _db.PaymentsDetails
                .Where(p => p.CropId == cropId)
                .ToListAsync();

            return Ok(payments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving payments for crop {CropId}", cropId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}/status")]
    [Authorize(Policy = "DealerOnly")]
    public async Task<ActionResult> UpdatePaymentStatus(int id, [FromBody] UpdatePaymentStatusRequest request)
    {
        try
        {
            var dealerIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(dealerIdClaim))
            {
                return Unauthorized("Unable to identify user");
            }
            
            var dealerId = int.Parse(dealerIdClaim);

            var payment = await _db.PaymentsDetails.FindAsync(id);
            if (payment == null)
                return NotFound("Payment not found");

            if (payment.DealerId != dealerId)
            {
                return Forbid("You are not authorized to update this payment");
            }

            var validStatuses = new[] { "Pending", "Processing", "Completed", "Failed", "Cancelled" };
            if (!validStatuses.Contains(request.Status, StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest($"Invalid status. Allowed values: {string.Join(", ", validStatuses)}");
            }

            if (payment.TransactionStatus.Equals("Completed", StringComparison.OrdinalIgnoreCase) ||
                payment.TransactionStatus.Equals("Cancelled", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest($"Cannot update payment with status '{payment.TransactionStatus}'");
            }

            payment.TransactionStatus = request.Status;
            
            if (request.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase))
            {
                payment.CanBeReviewed = true;
            }

            _db.PaymentsDetails.Update(payment);
            await _db.SaveChangesAsync();

            // Send email notification
            var dealer = await _db.DealersDetails.FindAsync(payment.DealerId);
            var crop = await _db.CropsDetails.FindAsync(payment.CropId);
            
            if (dealer != null && crop != null)
            {
                await _emailService.SendPaymentConfirmationEmailAsync(
                    dealer.DealerEmailAddress,
                    dealer.DealerName,
                    crop.CropName,
                    (decimal)payment.Amount,
                    payment.TransactionStatus
                );
            }
            
            _logger.LogInformation("Payment {PaymentId} status updated to {Status} by Dealer {DealerId}", 
                id, request.Status, dealerId);
            
            return Ok(new 
            { 
                Message = "Payment status updated successfully", 
                PaymentId = payment.PaymentId,
                NewStatus = payment.TransactionStatus,
                CanBeReviewed = payment.CanBeReviewed
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating payment status for payment {PaymentId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("admin/{id}/status")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> AdminUpdatePaymentStatus(int id, [FromBody] UpdatePaymentStatusRequest request)
    {
        try
        {
            var payment = await _db.PaymentsDetails.FindAsync(id);
            if (payment == null)
                return NotFound("Payment not found");

            var validStatuses = new[] { "Pending", "Processing", "Completed", "Failed", "Cancelled" };
            if (!validStatuses.Contains(request.Status, StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest($"Invalid status. Allowed values: {string.Join(", ", validStatuses)}");
            }

            payment.TransactionStatus = request.Status;
            
            if (request.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase))
            {
                payment.CanBeReviewed = true;
            }

            _db.PaymentsDetails.Update(payment);
            await _db.SaveChangesAsync();

            // Send email notification
            var dealer = await _db.DealersDetails.FindAsync(payment.DealerId);
            var crop = await _db.CropsDetails.FindAsync(payment.CropId);
            
            if (dealer != null && crop != null)
            {
                await _emailService.SendPaymentConfirmationEmailAsync(
                    dealer.DealerEmailAddress,
                    dealer.DealerName,
                    crop.CropName,
                    (decimal)payment.Amount,
                    payment.TransactionStatus
                );
            }
            
            _logger.LogInformation("Admin updated Payment {PaymentId} status to {Status}", id, request.Status);
            
            return Ok(new 
            { 
                Message = "Payment status updated successfully by Admin", 
                PaymentId = payment.PaymentId,
                NewStatus = payment.TransactionStatus 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating payment status for payment {PaymentId}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}