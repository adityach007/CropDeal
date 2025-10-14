namespace SprintEvaluationProjectCropDeal.Services.Interfaces;

public interface IEmailService
{
    Task SendPurchaseRequestEmailAsync(string farmerEmail, string farmerName, string dealerName, 
        string cropName, int quantity, decimal amount);
    
    Task SendPaymentConfirmationEmailAsync(string dealerEmail, string dealerName, string cropName, 
        decimal amount, string transactionStatus);
    
    Task SendPurchaseConfirmedEmailAsync(string dealerEmail, string dealerName, string cropName, 
        int quantity, decimal amount);
    
    Task SendReviewNotificationEmailAsync(string farmerEmail, string farmerName, string dealerName,
        string cropName, int rating, string reviewText);
    
    Task SendWelcomeEmailAsync(string email, string name, string role);

    Task SendLowStockAlertEmailAsync(string farmerEmail, string farmerName, string cropName,
        int remainingQuantity);
        
    Task SendEmailAsync(string to, string subject, string body);

    Task SendCropListingConfirmationAsync(
        string farmerEmail,
        string farmerName,
        string cropName,
        decimal quantityInKg,
        decimal pricePerUnit);
        
    Task SendCropUpdateNotificationAsync(
        string farmerEmail,
        string farmerName,
        string cropName,
        decimal quantityInKg,
        decimal pricePerUnit);
    
    Task SendCropDeletionNotificationAsync(
        string farmerEmail,
        string farmerName,
        string cropName);
}