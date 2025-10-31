# 🔧 Frontend Quick Fix - Add Payment Button

## Problem
After farmer confirms purchase, it shows "Purchase Confirmed" but doesn't ask for payment.

## Solution
Add a "Pay Now" button that appears after confirmation.

---

## Step 1: Update Purchase List Component

Find your dealer's purchase list component (probably in `cropdealfrontend/src/app/...`)

### In the HTML Template:

```html
<div *ngFor="let purchase of purchases" class="purchase-card">
  <h3>{{ purchase.crop?.cropName }}</h3>
  <p>Quantity: {{ purchase.quantityRequested }}</p>
  <p>Amount: ₹{{ calculateAmount(purchase) }}</p>
  
  <!-- Status Badge -->
  <span *ngIf="!purchase.isConfirmed" class="badge pending">
    Pending Farmer Approval
  </span>
  
  <span *ngIf="purchase.isConfirmed && !isPaid(purchase)" class="badge confirmed">
    ✅ Confirmed - Payment Required
  </span>
  
  <span *ngIf="isPaid(purchase)" class="badge paid">
    ✅ Paid
  </span>
  
  <!-- Pay Now Button - Shows only when confirmed but not paid -->
  <button *ngIf="purchase.isConfirmed && !isPaid(purchase)" 
          class="btn-pay"
          (click)="initiatePayment(purchase.purchaseId)">
    💳 Pay Now
  </button>
</div>
```

### In the TypeScript Component:

```typescript
export class DealerPurchasesComponent {
  purchases: any[] = [];
  
  // Check if purchase is paid by checking payments table
  isPaid(purchase: any): boolean {
    // Option 1: If you fetch payment status separately
    return purchase.paymentStatus === 'Completed';
    
    // Option 2: If you add IsPaid field to CropPurchase model
    // return purchase.isPaid;
  }
  
  calculateAmount(purchase: any): number {
    return purchase.quantityRequested * purchase.crop?.pricePerUnit || 0;
  }
  
  initiatePayment(purchaseId: number) {
    // Navigate to payment page
    this.router.navigate(['/payment', purchaseId]);
  }
}
```

---

## Step 2: Create Payment Page Component

Create a new component: `ng generate component payment`

### payment.component.ts:

```typescript
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { loadStripe, Stripe } from '@stripe/stripe-js';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html'
})
export class PaymentComponent implements OnInit {
  purchaseId: number = 0;
  amount: number = 0;
  loading: boolean = false;
  error: string = '';
  
  private stripe: Stripe | null = null;
  private apiUrl = 'http://localhost:5000/api'; // Your backend URL

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  async ngOnInit() {
    this.purchaseId = Number(this.route.snapshot.paramMap.get('purchaseId'));
    
    // Initialize Stripe with your publishable key
    this.stripe = await loadStripe('pk_test_YOUR_PUBLISHABLE_KEY');
  }

  async processPayment() {
    if (!this.stripe) {
      this.error = 'Payment system not loaded';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      // Step 1: Create payment intent from backend
      const response: any = await this.http.post(
        `${this.apiUrl}/payment/create-stripe-payment`,
        { purchaseId: this.purchaseId }
      ).toPromise();

      this.amount = response.amount;

      // Step 2: Redirect to Stripe Checkout
      const { error } = await this.stripe.confirmCardPayment(
        response.clientSecret,
        {
          payment_method: {
            card: {
              // Card will be collected by Stripe
            }
          },
          return_url: window.location.origin + '/payment-success'
        }
      );

      if (error) {
        this.error = error.message || 'Payment failed';
      }
    } catch (err: any) {
      this.error = err.error?.message || 'Failed to process payment';
    } finally {
      this.loading = false;
    }
  }
}
```

### payment.component.html:

```html
<div class="payment-container">
  <h2>Complete Your Payment</h2>
  
  <div *ngIf="!loading && !error">
    <p>Purchase ID: {{ purchaseId }}</p>
    <p>Amount: ₹{{ amount }}</p>
    
    <button (click)="processPayment()" class="btn-primary">
      Proceed to Payment
    </button>
  </div>
  
  <div *ngIf="loading" class="loading">
    Processing payment...
  </div>
  
  <div *ngIf="error" class="error">
    {{ error }}
  </div>
</div>
```

---

## Step 3: Add Route

In your `app-routing.module.ts`:

```typescript
const routes: Routes = [
  // ... existing routes
  { path: 'payment/:purchaseId', component: PaymentComponent },
  { path: 'payment-success', component: PaymentSuccessComponent }
];
```

---

## Step 4: Install Stripe Package

```bash
cd cropdealfrontend
npm install @stripe/stripe-js
```

---

## Step 5: Update Backend Configuration

1. Get Stripe keys from https://dashboard.stripe.com/test/apikeys
2. Update `appsettings.json`:

```json
"Stripe": {
  "PublishableKey": "pk_test_YOUR_KEY_HERE",
  "SecretKey": "sk_test_YOUR_KEY_HERE",
  "WebhookSecret": ""
}
```

3. Run migration:
```bash
dotnet ef migrations add AddStripeFieldsToPayment
dotnet ef database update
```

---

## 🎯 Result

After these changes:

1. Dealer sees purchase list
2. When farmer confirms → Shows "✅ Confirmed - Payment Required"
3. Dealer clicks "Pay Now" button
4. Redirects to payment page
5. Dealer clicks "Proceed to Payment"
6. Stripe payment form appears
7. Payment completes
8. Status updates to "Paid"

---

## 🧪 Test Flow

1. Dealer creates purchase request
2. Farmer confirms it
3. Dealer sees "Pay Now" button ← **This was missing!**
4. Click "Pay Now"
5. Use test card: `4242 4242 4242 4242`
6. Payment succeeds

---

## Alternative: Simple Approach

If you want to test quickly without full Stripe UI, just add a button that calls the backend:

```typescript
async quickPay(purchaseId: number) {
  const response = await this.http.post('/api/payment/create-stripe-payment', 
    { purchaseId }).toPromise();
  
  alert('Payment initiated! ClientSecret: ' + response.clientSecret);
  // In production, you'd show Stripe payment form here
}
```

This will at least create the payment record and you can manually update status for testing.
