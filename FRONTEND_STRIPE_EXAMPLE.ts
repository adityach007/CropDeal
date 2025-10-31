// ============================================
// STRIPE PAYMENT SERVICE (Angular)
// ============================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';

@Injectable({
  providedIn: 'root'
})
export class StripePaymentService {
  private stripePromise: Promise<Stripe | null>;
  private apiUrl = 'http://localhost:5000/api/payment'; // Update with your API URL

  constructor(private http: HttpClient) {
    // Replace with your Stripe Publishable Key
    this.stripePromise = loadStripe('pk_test_YOUR_PUBLISHABLE_KEY');
  }

  // Create payment intent from backend
  createPaymentIntent(purchaseId: number) {
    return this.http.post<{
      clientSecret: string;
      paymentIntentId: string;
      paymentId: number;
      amount: number;
    }>(`${this.apiUrl}/create-stripe-payment`, { purchaseId });
  }

  // Get Stripe instance
  async getStripe(): Promise<Stripe | null> {
    return await this.stripePromise;
  }
}

// ============================================
// PAYMENT COMPONENT (Angular)
// ============================================

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StripePaymentService } from './stripe-payment.service';
import { Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';

@Component({
  selector: 'app-payment',
  template: `
    <div class="payment-container">
      <h2>Complete Your Payment</h2>
      
      <div class="payment-details">
        <p>Amount: ₹{{ amount }}</p>
        <p>Purchase ID: {{ purchaseId }}</p>
      </div>

      <form id="payment-form" (submit)="handleSubmit($event)">
        <div id="card-element" class="card-element"></div>
        <div id="card-errors" role="alert" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>
        
        <button type="submit" [disabled]="processing">
          {{ processing ? 'Processing...' : 'Pay Now' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .payment-container {
      max-width: 500px;
      margin: 50px auto;
      padding: 20px;
    }
    
    .card-element {
      border: 1px solid #ccc;
      padding: 12px;
      border-radius: 4px;
      margin: 20px 0;
    }
    
    button {
      width: 100%;
      padding: 12px;
      background: #5469d4;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    #card-errors {
      color: #fa755a;
      margin: 10px 0;
    }
  `]
})
export class PaymentComponent implements OnInit {
  purchaseId: number = 0;
  amount: number = 0;
  clientSecret: string = '';
  processing: boolean = false;
  errorMessage: string = '';
  
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private cardElement: StripeCardElement | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: StripePaymentService
  ) {}

  async ngOnInit() {
    // Get purchase ID from route
    this.purchaseId = Number(this.route.snapshot.paramMap.get('purchaseId'));
    
    // Initialize Stripe
    this.stripe = await this.paymentService.getStripe();
    
    if (!this.stripe) {
      this.errorMessage = 'Failed to load payment system';
      return;
    }

    // Create payment intent
    this.paymentService.createPaymentIntent(this.purchaseId).subscribe({
      next: (response) => {
        this.clientSecret = response.clientSecret;
        this.amount = response.amount;
        this.setupStripeElements();
      },
      error: (error) => {
        this.errorMessage = 'Failed to initialize payment';
        console.error(error);
      }
    });
  }

  setupStripeElements() {
    if (!this.stripe) return;

    // Create Elements instance
    this.elements = this.stripe.elements();
    
    // Create Card Element
    this.cardElement = this.elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#32325d',
          '::placeholder': {
            color: '#aab7c4'
          }
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a'
        }
      }
    });

    // Mount Card Element
    this.cardElement.mount('#card-element');

    // Handle real-time validation errors
    this.cardElement.on('change', (event) => {
      if (event.error) {
        this.errorMessage = event.error.message;
      } else {
        this.errorMessage = '';
      }
    });
  }

  async handleSubmit(event: Event) {
    event.preventDefault();
    
    if (!this.stripe || !this.cardElement) {
      return;
    }

    this.processing = true;
    this.errorMessage = '';

    // Confirm payment
    const { error, paymentIntent } = await this.stripe.confirmCardPayment(
      this.clientSecret,
      {
        payment_method: {
          card: this.cardElement,
          billing_details: {
            // Add billing details if needed
          }
        }
      }
    );

    if (error) {
      this.errorMessage = error.message || 'Payment failed';
      this.processing = false;
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment successful
      this.router.navigate(['/payment-success'], {
        queryParams: { paymentId: paymentIntent.id }
      });
    }
  }
}

// ============================================
// ALTERNATIVE: STRIPE CHECKOUT (Simpler)
// ============================================

export class SimpleCheckoutComponent {
  constructor(private paymentService: StripePaymentService) {}

  async checkout(purchaseId: number) {
    const stripe = await this.paymentService.getStripe();
    
    if (!stripe) return;

    // Create payment intent
    this.paymentService.createPaymentIntent(purchaseId).subscribe({
      next: async (response) => {
        // Redirect to Stripe Checkout
        const { error } = await stripe.confirmCardPayment(response.clientSecret, {
          payment_method: {
            card: {
              // Card details will be collected by Stripe
            }
          },
          return_url: window.location.origin + '/payment-success'
        });

        if (error) {
          console.error(error);
        }
      }
    });
  }
}

// ============================================
// PAYMENT SUCCESS COMPONENT
// ============================================

@Component({
  selector: 'app-payment-success',
  template: `
    <div class="success-container">
      <div class="success-icon">✓</div>
      <h2>Payment Successful!</h2>
      <p>Your payment has been processed successfully.</p>
      <p>Payment ID: {{ paymentId }}</p>
      <button (click)="goToDashboard()">Go to Dashboard</button>
    </div>
  `,
  styles: [`
    .success-container {
      text-align: center;
      padding: 50px;
    }
    
    .success-icon {
      font-size: 72px;
      color: #4caf50;
      margin-bottom: 20px;
    }
    
    button {
      margin-top: 20px;
      padding: 12px 24px;
      background: #5469d4;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class PaymentSuccessComponent implements OnInit {
  paymentId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.paymentId = this.route.snapshot.queryParamMap.get('paymentId') || '';
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}

// ============================================
// MODULE SETUP
// ============================================

// In your app.module.ts or payment.module.ts:
/*
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    PaymentComponent,
    PaymentSuccessComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    StripePaymentService
  ]
})
export class PaymentModule { }
*/

// ============================================
// ROUTING SETUP
// ============================================

/*
const routes: Routes = [
  { path: 'payment/:purchaseId', component: PaymentComponent },
  { path: 'payment-success', component: PaymentSuccessComponent }
];
*/

// ============================================
// INSTALL DEPENDENCIES
// ============================================

/*
npm install @stripe/stripe-js
*/
