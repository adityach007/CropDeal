import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { PaymentService } from '../../services/payment.service';
import { AuthService } from '../../services/auth.service';
import { Payment } from '../../models/interfaces';

@Component({
  selector: 'app-payment-cards-farmer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-header">
      <h2><span class="header-icon">💳</span> Payment Management</h2>
      <span class="count-badge" *ngIf="payments.length > 0">{{ payments.length }}</span>
    </div>
    <div class="card-body">
      <div *ngIf="payments.length === 0" class="empty-state">
        <div class="empty-icon">💳</div>
        <h3>No Payments Yet</h3>
        <p>Payment records will appear here after confirmed purchases</p>
      </div>
      <div class="payments-list" *ngIf="payments.length > 0">
        <div *ngFor="let payment of payments; trackBy: trackByPaymentId" class="payment-item">
          <div class="payment-summary">
            <div class="payment-info">
              <div class="payment-title">
                <span class="payment-icon">💵</span>
                <span class="payment-id">Payment #{{ payment.paymentId }}</span>
                <span class="status-badge" [class]="getStatusClass(payment.transactionStatus)">
                  {{ getStatusIcon(payment.transactionStatus) }} {{ payment.transactionStatus }}
                </span>
              </div>
              <div class="payment-meta">
                <span class="meta-item amount">
                  <span class="meta-icon">₹</span>
                  {{ payment.amount | number:'1.0-0' }}
                </span>
                <span class="meta-item">
                  <span class="meta-icon">📅</span>
                  {{ payment.transactionDate | date:'MMM d' }}
                </span>
                <span class="meta-item" *ngIf="payment.canBeReviewed">
                  <span class="review-indicator">⭐ Reviewable</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem 2rem;
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      color: white;
      margin: 0;
    }

    .card-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .header-icon {
      font-size: 1.5rem;
    }

    .count-badge {
      background: rgba(255,255,255,0.2);
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .card-body {
      padding: 1.5rem 2rem;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: #666;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .empty-state p {
      margin: 0;
      opacity: 0.8;
    }

    .payments-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .payment-item {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .payment-item:hover {
      border-color: #4CAF50;
      box-shadow: 0 2px 8px rgba(76, 175, 80, 0.1);
    }

    .payment-summary {
      padding: 1rem 1.25rem;
    }

    .payment-info {
      width: 100%;
    }

    .payment-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      flex-wrap: wrap;
    }

    .payment-icon {
      font-size: 1rem;
    }

    .payment-id {
      font-weight: 600;
      color: #333;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-left: auto;
    }

    .status-badge.pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.processing {
      background: #cce5ff;
      color: #004085;
    }

    .status-badge.completed {
      background: #d1edff;
      color: #0c5460;
    }

    .status-badge.failed {
      background: #f8d7da;
      color: #721c24;
    }

    .status-badge.cancelled {
      background: #e2e3e5;
      color: #383d41;
    }

    .payment-meta {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.875rem;
      color: #666;
    }

    .meta-item.amount {
      font-weight: 600;
      color: #4CAF50;
      font-size: 1rem;
    }

    .meta-icon {
      font-size: 0.875rem;
    }

    .review-indicator {
      background: #fff3cd;
      color: #856404;
      padding: 0.125rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .payment-title {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .status-badge {
        margin-left: 0;
        align-self: flex-start;
      }
    }
  `]
})
export class PaymentCardsFarmerComponent implements OnInit {
  payments: Payment[] = [];

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.auth$.pipe(
      filter(user => user !== null)
    ).subscribe(currentUser => {
      const FARMER_TYPE = 1;
      if (currentUser && currentUser.userType === FARMER_TYPE) {
        this.loadPayments(currentUser.userId);
      }
    });
  }

  private loadPayments(farmerId: number) {
    this.paymentService.getPaymentsByFarmer(farmerId).subscribe({
      next: (payments) => {
        this.payments = payments;
      },
      error: (error) => {
        console.error('Error loading payments:', error);
        if (error.status === 401) {
          console.log('Authentication required - please login');
        } else if (error.status === 404) {
          console.log('Payment endpoint not found - check if backend is running');
        }
      }
    });
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return '⏳';
      case 'processing': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'cancelled': return '🚫';
      default: return '💳';
    }
  }

  trackByPaymentId(index: number, payment: Payment): number {
    return payment.paymentId;
  }
}