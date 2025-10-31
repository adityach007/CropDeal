# 💰 Complete Payment Flow in CropDeal

## 📊 Current Business Flow

### Step 1: Dealer Requests Purchase
```
Dealer → POST /api/croppurchase/crop-request-by-dealer/request
Body: { cropId, quantityRequested }
```
- Creates `CropPurchase` with `IsConfirmed = false`
- Farmer gets email notification

### Step 2: Farmer Confirms Purchase
```
Farmer → POST /api/croppurchase/crop-purchase-by-dealer/{id}/confirm
```
- Sets `IsConfirmed = true`
- Updates crop quantity
- Dealer gets email notification
- **NOW DEALER NEEDS TO PAY**

### Step 3: Dealer Makes Payment (NEW - STRIPE)
```
Dealer → POST /api/payment/create-stripe-payment
Body: { purchaseId }
```
- Backend creates Stripe PaymentIntent
- Returns `clientSecret` to frontend
- Frontend shows Stripe payment form
- Dealer enters card details
- Stripe processes payment
- Webhook updates payment status to "Completed"

### Step 4: Delivery & Review
- Once payment is completed, goods are delivered
- Dealer can submit review

---

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. DEALER REQUESTS PURCHASE                                 │
│    POST /api/croppurchase/crop-request-by-dealer/request    │
│    → CropPurchase created (IsConfirmed = false)             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. FARMER RECEIVES EMAIL & REVIEWS REQUEST                  │
│    Farmer checks: Crop availability, quantity, dealer       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. FARMER CONFIRMS PURCHASE                                 │
│    POST /api/croppurchase/crop-purchase-by-dealer/{id}/confirm│
│    → IsConfirmed = true                                     │
│    → Crop quantity reduced                                  │
│    → Dealer gets email: "Purchase confirmed, please pay"    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. DEALER INITIATES PAYMENT (STRIPE)                        │
│    POST /api/payment/create-stripe-payment                  │
│    Body: { purchaseId }                                     │
│    → Payment record created (Status = "Pending")            │
│    → Returns clientSecret                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. DEALER COMPLETES PAYMENT (FRONTEND)                      │
│    Frontend shows Stripe card form                          │
│    Dealer enters card details                               │
│    Stripe processes payment                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. STRIPE WEBHOOK UPDATES STATUS                            │
│    POST /api/payment/stripe-webhook                         │
│    → Payment status = "Completed"                           │
│    → CanBeReviewed = true                                   │
│    → Email sent to dealer & farmer                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. GOODS DELIVERED                                          │
│    Farmer ships/delivers the crops to dealer                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. DEALER SUBMITS REVIEW                                    │
│    POST /api/croppurchase/crop-purchased-submit/{id}/review │
│    Body: { rating, reviewText }                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 When Does Payment Happen?

**ANSWER: Between Step 3 and Step 7**

After farmer confirms → Dealer pays → Then delivery happens

---

## 💡 Frontend Implementation

### In Your Angular App:

**1. After Farmer Confirms, Show "Pay Now" Button to Dealer:**

```typescript
// In dealer's purchase list component
<div *ngFor="let purchase of purchases">
  <p>Crop: {{ purchase.cropName }}</p>
  <p>Status: {{ purchase.isConfirmed ? 'Confirmed' : 'Pending' }}</p>
  
  <!-- Show Pay button if confirmed but not paid -->
  <button *ngIf="purchase.isConfirmed && !purchase.isPaid" 
          (click)="initiatePayment(purchase.purchaseId)">
    Pay Now
  </button>
</div>
```

**2. Payment Component:**

```typescript
async initiatePayment(purchaseId: number) {
  // Step 1: Create payment intent
  const response = await this.http.post('/api/payment/create-stripe-payment', 
    { purchaseId }).toPromise();
  
  // Step 2: Show Stripe payment form
  this.router.navigate(['/payment', purchaseId], {
    queryParams: { clientSecret: response.clientSecret }
  });
}
```

---

## 🔍 How to Check Payment Status

### Option 1: Check Payment Table
```
GET /api/payment/by-dealer/{dealerId}
```
Returns all payments with status

### Option 2: Check Purchase with Payment Info
You might want to add a field to `CropPurchase`:
```csharp
public bool IsPaid { get; set; } = false;
```

Update this when payment completes.

---

## ⚠️ Important Notes

1. **Payment happens AFTER farmer confirms** - This ensures farmer has agreed to sell before dealer pays

2. **Delivery happens AFTER payment** - This protects the farmer from non-payment

3. **Review happens AFTER delivery** - Dealer can only review after receiving goods

4. **Webhook is crucial** - It automatically updates payment status when Stripe confirms payment

---

## 🚀 Quick Start

1. **Stop your app** and run migration:
   ```bash
   dotnet ef migrations add AddStripeFieldsToPayment
   dotnet ef database update
   ```

2. **Get Stripe keys** from dashboard

3. **Update appsettings.json**

4. **Test the flow:**
   - Dealer creates purchase request
   - Farmer confirms
   - Dealer clicks "Pay Now"
   - Payment form appears
   - Use test card: 4242 4242 4242 4242
   - Payment completes
   - Status updates automatically

---

## 📝 Summary

**YES, Stripe works between farmer approval and delivery:**

```
Dealer Request → Farmer Approves → STRIPE PAYMENT → Delivery → Review
```

This is the standard e-commerce flow and protects both parties!
