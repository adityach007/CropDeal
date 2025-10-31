using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SprintEvaluationProjectCropDeal.Data;
using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Models.DTO;
using SprintEvaluationProjectCropDeal.Services.Interfaces;
using IAuthService = SprintEvaluationProjectCropDeal.Services.Interfaces.IAuthorizationService;
using Microsoft.AspNetCore.Authorization;

namespace SprintEvaluationProjectCropDeal.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;
    private readonly ILogger<AdminController> _logger;
    private readonly IAuthService _authorizationService;

    public AdminController(IAdminService adminService, ILogger<AdminController> logger, IAuthService authorizationService)
    {
        _adminService = adminService;
        _logger = logger;
        _authorizationService = authorizationService;
    }

    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<IEnumerable<Admin>>> GetAll()
    {
        try
        {
            var admins = await _adminService.GetAllAsync();
            return Ok(admins);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all admins");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}/activate")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> ActivateAdmin(int id)
    {
        try
        {
            var admin = await _adminService.GetByIdAsync(id);
            if (admin == null)
                return NotFound($"Admin with ID {id} not found");

            admin.IsAdminIdActive = true;
            await _adminService.UpdateAsync(admin);

            return Ok(new { Message = "Admin activated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating admin {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}/deactivate")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> DeactivateAdmin(int id)
    {
        try
        {
            var admin = await _adminService.GetByIdAsync(id);
            if (admin == null)
                return NotFound($"Admin with ID {id} not found");

            // Prevent self-deactivation
            var currentUserId = _authorizationService.GetCurrentUserId(User);
            if (currentUserId == id)
                return BadRequest("You cannot deactivate your own account");

            admin.IsAdminIdActive = false;
            await _adminService.UpdateAsync(admin);

            return Ok(new { Message = "Admin deactivated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating admin {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("dashboard/stats")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> GetDashboardStats([FromServices] ApplicationDbContext db)
    {
        try
        {
            var stats = new
            {
                TotalFarmers = await db.FarmersDetails.CountAsync(),
                ActiveFarmers = await db.FarmersDetails.CountAsync(f => f.IsFarmerIdActive),
                TotalDealers = await db.DealersDetails.CountAsync(),
                ActiveDealers = await db.DealersDetails.CountAsync(d => d.IsDealerIdActive),
                TotalCrops = await db.CropsDetails.CountAsync(),
                TotalPurchases = await db.CropPurchases.CountAsync(),
                ConfirmedPurchases = await db.CropPurchases.CountAsync(p => p.IsConfirmed),
                TotalPayments = await db.PaymentsDetails.CountAsync(),
                CompletedPayments = await db.PaymentsDetails.CountAsync(p => p.TransactionStatus == "Completed"),
                TotalRevenue = await db.PaymentsDetails
                    .Where(p => p.TransactionStatus == "Completed")
                    .SumAsync(p => p.Amount)
            };

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting dashboard stats");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("all-payments")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> GetAllPayments([FromServices] ApplicationDbContext db)
    {
        try
        {
            var payments = await db.PaymentsDetails
                .OrderByDescending(p => p.TransactionDate)
                .Take(100)
                .ToListAsync();
            return Ok(payments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all payments");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("all-purchases")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> GetAllPurchases([FromServices] ApplicationDbContext db)
    {
        try
        {
            var purchases = await db.CropPurchases
                .Include(p => p.Crop)
                    .ThenInclude(c => c.Farmer)
                .Include(p => p.Dealer)
                .OrderByDescending(p => p.RequestedAt)
                .Take(100)
                .ToListAsync();
            return Ok(purchases);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all purchases");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("farmer/{id}/toggle-status")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> ToggleFarmerStatus(int id, [FromServices] ApplicationDbContext db)
    {
        try
        {
            var farmer = await db.FarmersDetails.FindAsync(id);
            if (farmer == null)
                return NotFound($"Farmer with ID {id} not found");

            farmer.IsFarmerIdActive = !farmer.IsFarmerIdActive;
            await db.SaveChangesAsync();

            return Ok(new { 
                Message = $"Farmer {(farmer.IsFarmerIdActive ? "activated" : "deactivated")} successfully",
                IsActive = farmer.IsFarmerIdActive
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error toggling farmer status {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("dealer/{id}/toggle-status")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> ToggleDealerStatus(int id, [FromServices] ApplicationDbContext db)
    {
        try
        {
            var dealer = await db.DealersDetails.FindAsync(id);
            if (dealer == null)
                return NotFound($"Dealer with ID {id} not found");

            dealer.IsDealerIdActive = !dealer.IsDealerIdActive;
            await db.SaveChangesAsync();

            return Ok(new { 
                Message = $"Dealer {(dealer.IsDealerIdActive ? "activated" : "deactivated")} successfully",
                IsActive = dealer.IsDealerIdActive
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error toggling dealer status {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("crop-analytics")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> GetCropAnalytics([FromServices] ApplicationDbContext db)
    {
        try
        {
            var salesByType = await db.CropPurchases
                .Include(p => p.Crop)
                .Where(p => p.IsConfirmed)
                .GroupBy(p => p.Crop.CropType)
                .Select(g => new
                {
                    CropType = g.Key,
                    TotalSales = g.Sum(p => p.QuantityRequested),
                    TotalOrders = g.Count(),
                    AverageOrderSize = g.Average(p => p.QuantityRequested)
                })
                .ToListAsync();

            var revenueByType = await (from purchase in db.CropPurchases
                                       join payment in db.PaymentsDetails on purchase.PurchaseId equals payment.PurchaseId
                                       join crop in db.CropsDetails on purchase.CropId equals crop.CropId
                                       where payment.TransactionStatus == "Completed"
                                       group payment by crop.CropType into g
                                       select new
                                       {
                                           CropType = g.Key,
                                           TotalRevenue = g.Sum(p => p.Amount),
                                           TransactionCount = g.Count()
                                       }).ToListAsync();

            var topCrops = await db.CropPurchases
                .Include(p => p.Crop)
                .Where(p => p.IsConfirmed)
                .GroupBy(p => new { p.Crop.CropName, p.Crop.CropType })
                .Select(g => new
                {
                    CropName = g.Key.CropName,
                    CropType = g.Key.CropType,
                    TotalQuantity = g.Sum(p => p.QuantityRequested),
                    OrderCount = g.Count()
                })
                .OrderByDescending(x => x.TotalQuantity)
                .Take(10)
                .ToListAsync();

            var monthlySales = await db.CropPurchases
                .Include(p => p.Crop)
                .Where(p => p.IsConfirmed && p.RequestedAt >= DateTime.Now.AddMonths(-6))
                .GroupBy(p => new { 
                    Month = p.RequestedAt.Month, 
                    Year = p.RequestedAt.Year,
                    CropType = p.Crop.CropType
                })
                .Select(g => new
                {
                    Month = g.Key.Month,
                    Year = g.Key.Year,
                    CropType = g.Key.CropType,
                    TotalQuantity = g.Sum(p => p.QuantityRequested),
                    OrderCount = g.Count()
                })
                .OrderBy(x => x.Year).ThenBy(x => x.Month)
                .ToListAsync();

            var farmerPerformance = await (from purchase in db.CropPurchases
                                           join crop in db.CropsDetails on purchase.CropId equals crop.CropId
                                           join farmer in db.FarmersDetails on crop.FarmerId equals farmer.FarmerId
                                           where purchase.IsConfirmed
                                           group purchase by new { farmer.FarmerId, farmer.FarmerName, farmer.IsVerified } into g
                                           select new
                                           {
                                               FarmerId = g.Key.FarmerId,
                                               FarmerName = g.Key.FarmerName,
                                               IsVerified = g.Key.IsVerified,
                                               TotalSales = g.Sum(p => p.QuantityRequested),
                                               OrderCount = g.Count()
                                           })
                                           .OrderByDescending(x => x.TotalSales)
                                           .Take(10)
                                           .ToListAsync();

            return Ok(new
            {
                SalesByType = salesByType,
                RevenueByType = revenueByType,
                TopCrops = topCrops,
                MonthlySales = monthlySales,
                FarmerPerformance = farmerPerformance
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting crop analytics");
            return StatusCode(500, "Internal server error");
        }
    }
}