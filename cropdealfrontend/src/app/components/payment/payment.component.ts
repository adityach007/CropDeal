import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-payment',
  imports: [CommonModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
  purchaseId: number = 0;
  amount: number = 0;
  loading: boolean = false;
  error: string = '';
  success: boolean = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private paymentService: PaymentService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.purchaseId = Number(this.route.snapshot.paramMap.get('purchaseId'));
  }

  processPayment() {
    this.loading = true;
    this.error = '';

    this.paymentService.createStripePayment(this.purchaseId).subscribe({
      next: (response) => {
        this.amount = response.amount;
        this.toast.info('Redirecting to payment gateway...');
        // Redirect to Stripe Checkout
        window.location.href = response.clientSecret;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create payment';
        this.toast.error(this.error);
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/dealer/dashboard']);
  }
}
