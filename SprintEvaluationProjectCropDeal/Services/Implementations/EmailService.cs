using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Services.Interfaces;

namespace SprintEvaluationProjectCropDeal.Services.Implementations;

public class EmailService : IEmailService
{
    private readonly EmailSettings _emailSettings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<EmailSettings> emailSettings, ILogger<EmailService> logger)
    {
        _emailSettings = emailSettings.Value;
        _logger = logger;
    }

    public async Task SendPurchaseRequestEmailAsync(string farmerEmail, string farmerName, 
        string dealerName, string cropName, int quantity, decimal amount)
    {
        var subject = "New Purchase Request for Your Crop";
        var htmlBody = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2 style='color: #2e7d32;'>New Purchase Request</h2>
                <p>Dear {farmerName},</p>
                <p>You have received a new purchase request from <strong>{dealerName}</strong>.</p>
                
                <div style='background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                    <h3 style='margin-top: 0;'>Purchase Details:</h3>
                    <ul style='list-style: none; padding: 0;'>
                        <li><strong>Crop:</strong> {cropName}</li>
                        <li><strong>Quantity Requested:</strong> {quantity} kg</li>
                        <li><strong>Total Amount:</strong> ₹{amount:N2}</li>
                        <li><strong>Price per Unit:</strong> ₹{(amount / quantity):N2}/kg</li>
                    </ul>
                </div>
                
                <p>Please log in to your account to review and confirm this purchase request.</p>
                
                <p style='margin-top: 30px;'>Best regards,<br/>CropDeal Platform</p>
            </body>
            </html>";

        await SendEmailAsync(farmerEmail, subject, htmlBody);
    }

    public async Task SendPurchaseConfirmedEmailAsync(string dealerEmail, string dealerName, 
        string cropName, int quantity, decimal amount)
    {
        var subject = "Purchase Request Confirmed!";
        var htmlBody = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2 style='color: #2e7d32;'>Purchase Confirmed! ✓</h2>
                <p>Dear {dealerName},</p>
                <p>Great news! The farmer has confirmed your purchase request.</p>
                
                <div style='background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                    <h3 style='margin-top: 0; color: #2e7d32;'>Confirmed Purchase Details:</h3>
                    <ul style='list-style: none; padding: 0;'>
                        <li><strong>Crop:</strong> {cropName}</li>
                        <li><strong>Quantity:</strong> {quantity} kg</li>
                        <li><strong>Total Amount:</strong> ₹{amount:N2}</li>
                    </ul>
                </div>
                
                <p>A payment request has been created. Please complete the payment to finalize this transaction.</p>
                
                <p style='margin-top: 30px;'>Best regards,<br/>CropDeal Platform</p>
            </body>
            </html>";

        await SendEmailAsync(dealerEmail, subject, htmlBody);
    }

    public async Task SendPaymentConfirmationEmailAsync(string dealerEmail, string dealerName, 
        string cropName, decimal amount, string transactionStatus)
    {
        var subject = "Payment Confirmation - CropDeal";
        var statusColor = transactionStatus.ToLower() == "completed" ? "#2e7d32" : "#ff9800";
        
        var htmlBody = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2 style='color: {statusColor};'>Payment {transactionStatus}</h2>
                <p>Dear {dealerName},</p>
                <p>This is to confirm your payment for the crop purchase.</p>
                
                <div style='background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                    <h3 style='margin-top: 0;'>Payment Details:</h3>
                    <ul style='list-style: none; padding: 0;'>
                        <li><strong>Crop:</strong> {cropName}</li>
                        <li><strong>Amount Paid:</strong> ₹{amount:N2}</li>
                        <li><strong>Status:</strong> <span style='color: {statusColor};'>{transactionStatus}</span></li>
                        <li><strong>Date:</strong> {DateTime.Now:dd/MM/yyyy HH:mm}</li>
                    </ul>
                </div>
                
                <p>Thank you for using CropDeal Platform!</p>
                
                <p style='margin-top: 30px;'>Best regards,<br/>CropDeal Platform</p>
            </body>
            </html>";

        await SendEmailAsync(dealerEmail, subject, htmlBody);
    }

    public async Task SendReviewNotificationEmailAsync(string farmerEmail, string farmerName, 
        string dealerName, string cropName, int rating, string reviewText)
    {
        var subject = "New Review Received for Your Crop";
        var stars = new string('⭐', rating);
        
        var htmlBody = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2 style='color: #2e7d32;'>New Review Received!</h2>
                <p>Dear {farmerName},</p>
                <p><strong>{dealerName}</strong> has left a review for your crop.</p>
                
                <div style='background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                    <h3 style='margin-top: 0;'>Review Details:</h3>
                    <p><strong>Crop:</strong> {cropName}</p>
                    <p><strong>Rating:</strong> {stars} ({rating}/5)</p>
                    <p><strong>Review:</strong></p>
                    <p style='background-color: white; padding: 10px; border-left: 3px solid #ff9800;'>
                        {(string.IsNullOrEmpty(reviewText) ? "No written review provided." : reviewText)}
                    </p>
                </div>
                
                <p>Keep up the great work! Customer reviews help build trust with other buyers.</p>
                
                <p style='margin-top: 30px;'>Best regards,<br/>CropDeal Platform</p>
            </body>
            </html>";

        await SendEmailAsync(farmerEmail, subject, htmlBody);
    }

    public async Task SendWelcomeEmailAsync(string email, string name, string role)
    {
        var subject = "Welcome to CropDeal Platform!";
        var htmlBody = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2 style='color: #2e7d32;'>Welcome to CropDeal! 🌾</h2>
                <p>Dear {name},</p>
                <p>Thank you for joining CropDeal as a <strong>{role}</strong>.</p>
                
                <div style='background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                    <h3 style='margin-top: 0;'>Your Account Details:</h3>
                    <ul style='list-style: none; padding: 0;'>
                        <li><strong>Email:</strong> {email}</li>
                        <li><strong>Role:</strong> {role}</li>
                        <li><strong>Registration Date:</strong> {DateTime.Now:dd/MM/yyyy}</li>
                    </ul>
                </div>
                
                {(role == "Farmer" ? 
                    "<p>You can now start listing your crops and connect with dealers across the platform.</p>" :
                    "<p>You can now browse available crops and make purchase requests to farmers.</p>")}
                
                <p>If you have any questions, feel free to contact our support team.</p>
                
                <p style='margin-top: 30px;'>Best regards,<br/>CropDeal Platform Team</p>
            </body>
            </html>";

        await SendEmailAsync(email, subject, htmlBody);
    }

    public async Task SendLowStockAlertEmailAsync(string farmerEmail, string farmerName, 
        string cropName, int remainingQuantity)
    {
        var subject = "Low Stock Alert - Action Required";
        var htmlBody = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2 style='color: #ff9800;'>⚠️ Low Stock Alert</h2>
                <p>Dear {farmerName},</p>
                <p>This is an automated alert regarding your crop inventory.</p>
                
                <div style='background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff9800;'>
                    <h3 style='margin-top: 0; color: #ff9800;'>Stock Status:</h3>
                    <ul style='list-style: none; padding: 0;'>
                        <li><strong>Crop:</strong> {cropName}</li>
                        <li><strong>Remaining Quantity:</strong> {remainingQuantity} kg</li>
                        <li><strong>Status:</strong> <span style='color: #d32f2f;'>Low Stock</span></li>
                    </ul>
                </div>
                
                <p>Your crop quantity is running low. Consider updating your inventory or adding new stock to continue receiving purchase requests.</p>
                
                <p style='margin-top: 30px;'>Best regards,<br/>CropDeal Platform</p>
            </body>
            </html>";

        await SendEmailAsync(farmerEmail, subject, htmlBody);
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_emailSettings.SenderName, _emailSettings.SenderEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;

        var builder = new BodyBuilder { HtmlBody = htmlBody };
        message.Body = builder.ToMessageBody();

        using var client = new SmtpClient();
        try
        {
            _logger.LogInformation("Connecting to SMTP server {Server}:{Port}", _emailSettings.SmtpServer, _emailSettings.SmtpPort);

            await client.ConnectAsync(_emailSettings.SmtpServer, _emailSettings.SmtpPort, SecureSocketOptions.None);

            if (!string.IsNullOrEmpty(_emailSettings.Username))
            {
                await client.AuthenticateAsync(_emailSettings.Username, _emailSettings.Password);
            }

            await client.SendAsync(message);
            _logger.LogInformation("Email sent successfully to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
            throw;
        }
        finally
        {
            await client.DisconnectAsync(true);
        }
    }


    public async Task SendCropListingConfirmationAsync(
        string farmerEmail,
        string farmerName,
        string cropName,
        decimal quantityInKg,
        decimal pricePerUnit)
    {
        var subject = "Crop Listing Confirmation - CropDeal";

        var body = $@"
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                    .content {{ background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }}
                    .crop-details {{ background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }}
                    .footer {{ text-align: center; margin-top: 20px; color: #777; font-size: 12px; }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>🌾 Crop Listing Confirmation</h1>
                    </div>
                    <div class='content'>
                        <h2>Hello {farmerName},</h2>
                        <p>Great news! Your crop listing has been successfully added to the CropDeal platform.</p>
                        
                        <div class='crop-details'>
                            <h3>📦 Listing Details:</h3>
                            <ul>
                                <li><strong>Crop Name:</strong> {cropName}</li>
                                <li><strong>Quantity:</strong> {quantityInKg:N2} kg</li>
                                <li><strong>Price per Unit:</strong> ₹{pricePerUnit:N2}</li>
                                <li><strong>Total Value:</strong> ₹{(quantityInKg * pricePerUnit):N2}</li>
                                <li><strong>Status:</strong> <span style='color: green;'>✅ Active</span></li>
                            </ul>
                        </div>
                        
                        <p><strong>What's Next?</strong></p>
                        <ul>
                            <li>Dealers can now view your listing</li>
                            <li>You'll receive notifications when dealers show interest</li>
                            <li>You can manage your listing from your dashboard</li>
                        </ul>
                        
                        <p>Thank you for choosing CropDeal to connect with buyers!</p>
                        
                        <p style='margin-top: 20px;'>
                            <strong>Best regards,</strong><br>
                            CropDeal Support Team
                        </p>
                    </div>
                    <div class='footer'>
                        <p>This is an automated message. Please do not reply to this email.</p>
                        <p>&copy; 2025 CropDeal Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>";

        await SendEmailAsync(farmerEmail, subject, body);
    }

    public async Task SendCropUpdateNotificationAsync(
        string farmerEmail,
        string farmerName,
        string cropName,
        decimal quantityInKg,
        decimal pricePerUnit)
    {
        var subject = "Crop Listing Updated - CropDeal";

        var htmlBody = $@"
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                    .content {{ background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }}
                    .crop-details {{ background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #FF9800; }}
                    .footer {{ text-align: center; margin-top: 20px; color: #777; font-size: 12px; }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>🔄 Crop Listing Updated</h1>
                    </div>
                    <div class='content'>
                        <h2>Hello {farmerName},</h2>
                        <p>Your crop listing has been successfully updated on the CropDeal platform.</p>
                        
                        <div class='crop-details'>
                            <h3>📦 Updated Details:</h3>
                            <ul>
                                <li><strong>Crop Name:</strong> {cropName}</li>
                                <li><strong>Quantity:</strong> {quantityInKg:N2} kg</li>
                                <li><strong>Price per Unit:</strong> ₹{pricePerUnit:N2}</li>
                                <li><strong>Total Value:</strong> ₹{(quantityInKg * pricePerUnit):N2}</li>
                                <li><strong>Updated On:</strong> {DateTime.Now:dd/MM/yyyy HH:mm}</li>
                            </ul>
                        </div>
                        
                        <p><strong>What's Next?</strong></p>
                        <ul>
                            <li>Your updated listing is now visible to dealers</li>
                            <li>Any pending purchase requests remain active</li>
                            <li>You can continue managing your listing from dashboard</li>
                        </ul>
                        
                        <p>Thank you for keeping your listings up to date!</p>
                        
                        <p style='margin-top: 20px;'>
                            <strong>Best regards,</strong><br>
                            CropDeal Support Team
                        </p>
                    </div>
                    <div class='footer'>
                        <p>This is an automated message. Please do not reply to this email.</p>
                        <p>&copy; 2025 CropDeal Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>";

        await SendEmailAsync(farmerEmail, subject, htmlBody);
    }
    
    public async Task SendCropDeletionNotificationAsync(
        string farmerEmail,
        string farmerName,
        string cropName)
    {
        var subject = "Crop Listing Deleted - CropDeal";
        
        var htmlBody = $@"
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #d32f2f; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                    .content {{ background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }}
                    .crop-details {{ background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #d32f2f; }}
                    .footer {{ text-align: center; margin-top: 20px; color: #777; font-size: 12px; }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>🗑️ Crop Listing Deleted</h1>
                    </div>
                    <div class='content'>
                        <h2>Hello {farmerName},</h2>
                        <p>This is to confirm that your crop listing has been removed from the CropDeal platform.</p>
                        
                        <div class='crop-details'>
                            <h3>📦 Deleted Listing:</h3>
                            <ul>
                                <li><strong>Crop Name:</strong> {cropName}</li>
                                <li><strong>Deleted On:</strong> {DateTime.Now:dd/MM/yyyy HH:mm}</li>
                                <li><strong>Status:</strong> <span style='color: #d32f2f;'>❌ Removed</span></li>
                            </ul>
                        </div>
                        
                        <p><strong>Important Notes:</strong></p>
                        <ul>
                            <li>This listing is no longer visible to dealers</li>
                            <li>Any pending purchase requests have been cancelled</li>
                            <li>You can add a new listing anytime from your dashboard</li>
                        </ul>
                        
                        <p>If this was done by mistake, you can create a new listing with the same details.</p>
                        
                        <p style='margin-top: 20px;'>
                            <strong>Best regards,</strong><br>
                            CropDeal Support Team
                        </p>
                    </div>
                    <div class='footer'>
                        <p>This is an automated message. Please do not reply to this email.</p>
                        <p>&copy; 2025 CropDeal Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>";

        await SendEmailAsync(farmerEmail, subject, htmlBody);
    }
}