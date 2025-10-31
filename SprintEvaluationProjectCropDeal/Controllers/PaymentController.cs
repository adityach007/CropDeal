using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SprintEvaluationProjectCropDeal.Data;
using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Models.DTOs.Payment;
using SprintEvaluationProjectCropDeal.Services.Interfaces;
using System.IO;

namespace SprintEvaluationProjectCropDeal.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<PaymentController> _logger;
    private readonly IEmailService _emailService;
    private readonly IPaymentService _paymentService;

    public PaymentController(
        ApplicationDbContext db, 
        ILogger<PaymentController> logger,
        IEmailService emailService,
        IPaymentService paymentService)
    {
        _db = db;
        _logger = logger;
        _emailService = emailService;
        _paymentService = paymentService;
    }

    [HttpGet("test")]
    [AllowAnonymous]
    public ActionResult<string> TestEndpoint()
    {
        return Ok("Payment API is working!");
    }

    [HttpGet("by-farmer/{farmerId}")]
    [Authorize(Policy = "FarmerOrDealer")]
    public async Task<ActionResult<IEnumerable<Payment>>> GetPaymentsByFarmerId(int farmerId)
    {
        try
        {
            var payments = await _db.PaymentsDetails
                .Where(p => p.FarmerId == farmerId)
                .ToListAsync();

            return Ok(payments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving payments for farmer {FarmerId}", farmerId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("by-dealer/{dealerId}")]
    [Authorize(Policy = "FarmerOrDealer")]
    public async Task<ActionResult<IEnumerable<Payment>>> GetPaymentsByDealerId(int dealerId)
    {
        try
        {
            var payments = await _db.PaymentsDetails
                .Where(p => p.DealerId == dealerId)
                .ToListAsync();

            return Ok(payments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving payments for dealer {DealerId}", dealerId);
            return StatusCode(500, "Internal server error");
        }
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

    // Removed - Dealers cannot manually update payment status
    // Payment status is automatically updated by Stripe webhook

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

    [HttpPost("create-stripe-payment")]
    [Authorize(Policy = "DealerOnly")]
    public async Task<ActionResult<StripePaymentResponse>> CreateStripePayment([FromBody] CreateStripePaymentRequest request)
    {
        try
        {
            var dealerIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(dealerIdClaim))
                return Unauthorized("Unable to identify user");

            var dealerId = int.Parse(dealerIdClaim);

            var purchase = await _db.CropPurchases.FindAsync(request.PurchaseId);
            if (purchase == null)
                return NotFound("Purchase not found");

            if (purchase.DealerId != dealerId)
                return Forbid("You are not authorized to create payment for this purchase");

            var response = await _paymentService.CreateStripePaymentIntentAsync(request.PurchaseId);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating Stripe payment");
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("stripe-webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> StripeWebhook()
    {
        try
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            var signature = Request.Headers["Stripe-Signature"].ToString();

            var success = await _paymentService.HandleStripeWebhookAsync(json, signature);
            
            if (success)
                return Ok();
            
            return BadRequest();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing Stripe webhook");
            return StatusCode(500);
        }
    }
}