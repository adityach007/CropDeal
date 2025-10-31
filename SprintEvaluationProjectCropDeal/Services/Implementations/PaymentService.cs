using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Models.DTOs.Payment;
using SprintEvaluationProjectCropDeal.Repositories.Interfaces;
using SprintEvaluationProjectCropDeal.Services.Interfaces;
using SprintEvaluationProjectCropDeal.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Stripe;

namespace SprintEvaluationProjectCropDeal.Services.Implementations;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly ApplicationDbContext _db;
    private readonly IConfiguration _configuration;

    public PaymentService(IPaymentRepository paymentRepository, ApplicationDbContext db, IConfiguration configuration)
    {
        _paymentRepository = paymentRepository;
        _db = db;
        _configuration = configuration;
        StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
    }

    public async Task<IEnumerable<Payment>> GetAllAsync()
    {
        return await _paymentRepository.GetAllAsync();
    }

    public async Task<Payment?> GetByIdAsync(int id)
    {
        return await _paymentRepository.GetByIdAsync(id);
    }

    public async Task AddAsync(Payment payment)
    {
        await _paymentRepository.AddAsync(payment);
    }

    public async Task UpdateAsync(Payment payment)
    {
        await _paymentRepository.UpdateAsync(payment);
    }

    public async Task DeleteAsync(int id)
    {
        await _paymentRepository.DeleteAsync(id);
    }

    public async Task<StripePaymentResponse> CreateStripePaymentIntentAsync(int purchaseId)
    {
        // Check if payment already exists for this purchase
        var existingPayment = await _db.PaymentsDetails
            .FirstOrDefaultAsync(p => p.PurchaseId == purchaseId);
        
        if (existingPayment != null)
            throw new Exception("Payment already exists for this purchase");

        var purchase = await _db.CropPurchases
            .Include(p => p.Crop)
            .Include(p => p.Dealer)
            .FirstOrDefaultAsync(p => p.PurchaseId == purchaseId)
            ?? throw new Exception("Purchase not found");

        if (purchase.Crop == null)
            throw new Exception("Crop details not found");
        
        if (!purchase.IsConfirmed)
            throw new Exception("Purchase must be confirmed by farmer first");

        var amount = purchase.QuantityRequested * purchase.Crop.PricePerUnit;

        // Create Stripe Checkout Session
        var options = new Stripe.Checkout.SessionCreateOptions
        {
            PaymentMethodTypes = new List<string> { "card" },
            LineItems = new List<Stripe.Checkout.SessionLineItemOptions>
            {
                new Stripe.Checkout.SessionLineItemOptions
                {
                    PriceData = new Stripe.Checkout.SessionLineItemPriceDataOptions
                    {
                        Currency = "inr",
                        ProductData = new Stripe.Checkout.SessionLineItemPriceDataProductDataOptions
                        {
                            Name = $"Purchase #{purchaseId} - {purchase.Crop.CropName}",
                            Description = $"{purchase.QuantityRequested} kg at ₹{purchase.Crop.PricePerUnit}/kg"
                        },
                        UnitAmount = (long)(amount * 100)
                    },
                    Quantity = 1
                }
            },
            Mode = "payment",
            SuccessUrl = "http://localhost:4200/dealer/dashboard?payment=success",
            CancelUrl = "http://localhost:4200/dealer/dashboard?payment=cancelled",
            Metadata = new Dictionary<string, string>
            {
                { "purchaseId", purchaseId.ToString() },
                { "dealerId", purchase.DealerId.ToString() },
                { "cropId", purchase.CropId.ToString() },
                { "farmerId", purchase.Crop.FarmerId.ToString() }
            }
        };

        var service = new Stripe.Checkout.SessionService();
        var session = await service.CreateAsync(options);

        var payment = new Models.Payment
        {
            FarmerId = purchase.Crop.FarmerId,
            DealerId = purchase.DealerId,
            CropId = purchase.CropId,
            PurchaseId = purchaseId,
            Amount = amount,
            TransactionDate = DateTime.UtcNow,
            TransactionStatus = "Pending",
            StripeSessionId = session.Id
        };

        await _paymentRepository.AddAsync(payment);

        return new StripePaymentResponse
        {
            ClientSecret = session.Url,
            PaymentIntentId = session.Id,
            PaymentId = payment.PaymentId,
            Amount = amount
        };
    }

    public async Task<bool> HandleStripeWebhookAsync(string json, string signature)
    {
        try
        {
            var webhookSecret = _configuration["Stripe:WebhookSecret"];
            var stripeEvent = EventUtility.ConstructEvent(json, signature, webhookSecret);

            if (stripeEvent.Type == "checkout.session.completed")
            {
                var session = stripeEvent.Data.Object as Stripe.Checkout.Session;
                if (session != null)
                {
                    var payment = await _db.PaymentsDetails
                        .FirstOrDefaultAsync(p => p.StripeSessionId == session.Id);

                    if (payment != null)
                    {
                        payment.TransactionStatus = "Completed";
                        payment.CanBeReviewed = true;
                        await _paymentRepository.UpdateAsync(payment);
                    }
                }
            }
            else if (stripeEvent.Type == "checkout.session.expired")
            {
                var session = stripeEvent.Data.Object as Stripe.Checkout.Session;
                if (session != null)
                {
                    var payment = await _db.PaymentsDetails
                        .FirstOrDefaultAsync(p => p.StripeSessionId == session.Id);

                    if (payment != null)
                    {
                        payment.TransactionStatus = "Failed";
                        await _paymentRepository.UpdateAsync(payment);
                    }
                }
            }

            return true;
        }
        catch
        {
            return false;
        }
    }
}