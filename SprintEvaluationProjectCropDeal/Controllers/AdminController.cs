using Microsoft.AspNetCore.Mvc;
using SprintEvaluationProjectCropDeal.Models;
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

    // [HttpGet("email/{email}")]
    // [Authorize(Policy = "AdminOnly")]
    // public async Task<ActionResult<Admin>> GetByEmail(string email)
    // {
    //     try
    //     {
    //         var admin = await _adminService.GetByEmailAsync(email);
    //         if (admin == null)
    //             return NotFound($"Admin with email {email} not found");

    //         return Ok(admin);
    //     }
    //     catch (Exception ex)
    //     {
    //         _logger.LogError(ex, "Error getting admin by email {Email}", email);
    //         return StatusCode(500, "Internal server error");
    //     }
    // }
}