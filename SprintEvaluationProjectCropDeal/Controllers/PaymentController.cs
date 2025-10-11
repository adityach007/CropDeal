using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SprintEvaluationProjectCropDeal.Data;
using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Models.DTOs.Payment;

namespace SprintEvaluationProjectCropDeal.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<PaymentController> _logger;

    public PaymentController(ApplicationDbContext db, ILogger<PaymentController> logger)
    {
        _db = db;
        _logger = logger;
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
            _logger.LogError(ex, "Error getting payment {PaymentId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("all-payments")]
    [Authorize(Policy = "FarmerOrDealer")]
    public async Task<ActionResult<IEnumerable<Payment>>> GetAllPayments()
    {
        try
        {
            var payments = await _db.PaymentsDetails.ToListAsync();
            return Ok(payments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all payments");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("by-farmer/{farmerId}")]
    [Authorize(Policy = "FarmerOnly")]
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
            _logger.LogError(ex, "Error getting payments for farmer {FarmerId}", farmerId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("by-dealer/{dealerId}")]
    [Authorize(Policy = "DealerOnly")]
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
            _logger.LogError(ex, "Error getting payments for dealer {DealerId}", dealerId);
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
            _logger.LogError(ex, "Error getting payments for crop {CropId}", cropId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}/status")]
    [Authorize(Policy = "DealerOnly")]
    public async Task<ActionResult> UpdatePaymentStatus(int id, [FromBody] UpdatePaymentStatusRequest request)
    {
        try
        {
            var payment = await _db.PaymentsDetails.FindAsync(id);
            if (payment == null)
                return NotFound("Payment not found");

            payment.TransactionStatus = request.Status;
            
            if (request.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase))
            {
                payment.CanBeReviewed = true;
            }

            _db.PaymentsDetails.Update(payment);
            await _db.SaveChangesAsync();
            
            return Ok(new { Message = "Payment status updated successfully", Payment = payment });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating payment status for payment {PaymentId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> DeletePayment(int id)
    {
        try
        {
            var payment = await _db.PaymentsDetails.FindAsync(id);
            if (payment == null)
                return NotFound("Payment not found");

            _db.PaymentsDetails.Remove(payment);
            await _db.SaveChangesAsync();

            return Ok(new { Message = "Payment deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting payment {PaymentId}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}