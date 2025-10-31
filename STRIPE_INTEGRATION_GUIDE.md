# Stripe Payment Gateway Integration Guide

## ✅ What Has Been Implemented

### 1. **NuGet Package Installed**
- `Stripe.net` (v49.1.0) - Official Stripe SDK for .NET

### 2. **Database Changes**
- Added `StripePaymentIntentId` field to Payment model
- Added `StripeSessionId` field to Payment model

### 3. **New DTOs Created**
- `CreateStripePaymentRequest` - Request to create payment
- `StripePaymentResponse` - Response with client secret and payment details

### 4. **Service Layer Updates**
- Extended `IPaymentService` with:
  - `CreateStripePaymentIntentAsync()` - Creates Stripe payment intent
  - `HandleStripeWebhookAsync()` - Processes Stripe webhooks
- Implemented Stripe payment logic in `PaymentService`

### 5. **Controller Endpoints Added**
- `POST /api/payment/create-stripe-payment` - Creates payment intent (Dealer only)
- `POST /api/payment/stripe-webhook` - Handles Stripe webhooks (Public)

### 6. **Configuration**
- Added Stripe settings to `appsettings.json`

---

## 🚀 Setup Instructions

### Step 1: Get Stripe API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create an account or login
3. Navigate to **Developers → API Keys**
4. Copy your **Publishable Key** and **Secret Key**

### Step 2: Update Configuration
Open `appsettings.json` and replace the placeholder values:

```json
"Stripe": {
  "PublishableKey": "pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY",
  "SecretKey": "sk_test_YOUR_ACTUAL_SECRET_KEY",
  "WebhookSecret": ""
}
```

### Step 3: Run Database Migration
**IMPORTANT:** Stop your running application first, then run:

```bash
cd SprintEvaluationProjectCropDeal
dotnet ef migrations add AddStripeFieldsToPayment
dotnet ef database update
```

### Step 4: Setup Stripe Webhook (For Production/Testing)
1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks to local:
   ```bash
   stripe listen --forward-to https://localhost:5001/api/payment/stripe-webhook
   ```
4. Copy the webhook signing secret and update `appsettings.json`

---

## 📋 How It Works

### Payment Flow:

1. **Dealer creates purchase** → Gets `PurchaseId`
2. **Dealer initiates payment**:
   ```
   POST /api/payment/create-stripe-payment
   Body: { "purchaseId": 123 }
   ```
3. **Backend creates PaymentIntent** → Returns `clientSecret`
4. **Frontend uses clientSecret** with Stripe.js to collect payment
5. **Stripe processes payment** → Sends webhook to backend
6. **Backend updates payment status** automatically

---

## 🔌 API Endpoints

### Create Payment Intent
```http
POST /api/payment/create-stripe-payment
Authorization: Bearer {dealer_token}
Content-Type: application/json

{
  "purchaseId": 123
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "paymentId": 456,
  "amount": 5000.00
}
```

### Webhook Endpoint
```http
POST /api/payment/stripe-webhook
Stripe-Signature: {stripe_signature}
Content-Type: application/json

{Stripe webhook payload}
```

---

## 🎨 Frontend Integration (Angular)

### Step 1: Install Stripe.js
```bash
npm install @stripe/stripe-js
```

### Step 2: Create Payment Component
```typescript
import { loadStripe } from '@stripe/stripe-js';

export class PaymentComponent {
  private stripe = loadStripe('pk_test_YOUR_PUBLISHABLE_KEY');

  async createPayment(purchaseId: number) {
    // Call your backend
    const response = await this.http.post('/api/payment/create-stripe-payment', 
      { purchaseId }).toPromise();
    
    const stripe = await this.stripe;
    const { error } = await stripe.confirmPayment({
      clientSecret: response.clientSecret,
      confirmParams: {
        return_url: 'http://localhost:4200/payment-success',
      },
    });

    if (error) {
      console.error(error.message);
    }
  }
}
```

### Step 3: Add Stripe Elements (Card Payment Form)
```html
<form id="payment-form">
  <div id="card-element"></div>
  <button type="submit">Pay Now</button>
</form>
```

```typescript
const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#card-element');
```

---

## 🔒 Security Notes

1. **Never expose Secret Key** in frontend
2. **Use HTTPS** in production
3. **Validate webhook signatures** (already implemented)
4. **Store keys in environment variables** for production

---

## 🧪 Testing

### Test Cards (Stripe Test Mode):
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **3D Secure:** 4000 0025 0000 3155

Use any future expiry date and any 3-digit CVC.

---

## 📊 Payment Status Flow

```
Pending → Processing → Completed (via webhook)
                    ↓
                  Failed (via webhook)
```

When payment succeeds:
- Status → "Completed"
- CanBeReviewed → true
- Email sent to dealer

---

## 🐛 Troubleshooting

### Build Error: "File is locked"
- Stop the running application
- Close Visual Studio/VS Code
- Run `dotnet clean` then `dotnet build`

### Webhook Not Working
- Check webhook secret in appsettings.json
- Verify Stripe CLI is running
- Check logs for signature validation errors

### Payment Not Creating
- Verify Stripe API keys are correct
- Check purchase exists and belongs to dealer
- Ensure crop has valid price

---

## 📚 Additional Resources

- [Stripe .NET SDK Docs](https://stripe.com/docs/api?lang=dotnet)
- [Stripe Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)

---

## ✨ Next Steps

1. Stop your running application
2. Run the database migration
3. Get Stripe API keys
4. Update appsettings.json
5. Test the payment flow
6. Integrate frontend with Stripe.js

**Need help?** Check Stripe documentation or test with Stripe CLI!
