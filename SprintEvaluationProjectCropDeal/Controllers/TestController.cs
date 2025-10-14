using Microsoft.AspNetCore.Mvc;
using SprintEvaluationProjectCropDeal.Services.Interfaces;

namespace SprintEvaluationProjectCropDeal.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    private readonly IEmailService _emailService;

    public TestController(IEmailService emailService)
    {
        _emailService = emailService;
    }

    [HttpPost("send-test-email")]
    public async Task<IActionResult> SendTestEmail([FromQuery] string email = "farmer@test.com")
    {
        try
        {
            await _emailService.SendPurchaseRequestEmailAsync(
                email,
                "John Farmer",
                "Mike Dealer",
                "Wheat",
                100,
                5000
            );

            return Ok(new 
            { 
                message = "Test email sent successfully!", 
                info = "Check MailHog at http://localhost:8025" 
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}