import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter, forkJoin } from 'rxjs';
import { PurchasesService, Purchase } from '../../services/purchases.service';
import { AuthService } from '../../services/auth.service';
import { PurchaseRequestService, ReviewRequest } from '../../services/purchase-request.service';
import { PaymentService } from '../../services/payment.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-purchases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card-header">
      <h2><span class="header-icon">🛒</span> My Purchases</h2>
      <span class="count-badge" *ngIf="purchases.length > 0">{{ purchases.length }}</span>
    </div>
    <div class="card-body">
      <div *ngIf="purchases.length === 0" class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>No Purchases Yet</h3>
        <p>Your purchase requests will appear here once you start ordering crops</p>
      </div>
      <div class="purchases-list" *ngIf="purchases.length > 0">
        <div *ngFor="let purchase of purchases; trackBy: trackByPurchaseId" class="purchase-item">
          <div class="purchase-summary">
            <div class="purchase-info">
              <div class="purchase-title">
                <span class="purchase-icon">📎</span>
                <span class="purchase-id">Purchase #{{ purchase.purchaseId }}</span>
                <span class="status-badge" [class]="purchase.isConfirmed ? 'confirmed' : 'pending'">
                  {{ purchase.isConfirmed ? '✅ Confirmed' : '⏳ Pending' }}
                </span>
                <button *ngIf="purchase.isConfirmed && !purchase.paymentExists" 
                        (click)="initiatePayment(purchase.purchaseId)"
                        class="btn-pay-now">
                  💳 Pay Now
                </button>
                <span *ngIf="purchase.paymentExists" class="status-badge paid">
                  ✅ Paid
                </span>
              </div>
              <div class="purchase-meta">
                <span class="meta-item" *ngIf="purchase.crop?.cropName">
                  <span class="meta-icon">🌾</span>
                  {{ purchase.crop?.cropName }}
                </span>
                <span class="meta-item" *ngIf="purchase.crop?.farmer?.farmerName">
                  <span class="meta-icon">👨‍🌾</span>
                  {{ purchase.crop?.farmer?.farmerName }}
                </span>
                <span class="meta-item">
                  <span class="meta-icon">📦</span>
                  {{ purchase.quantityRequested }} kg
                </span>
                <span class="meta-item">
                  <span class="meta-icon">📅</span>
                  {{ purchase.requestedAt | date:'MMM d' }}
                </span>
                <span class="meta-item" *ngIf="purchase.hasBeenReviewed">
                  <span class="meta-icon">⭐</span>
                  {{ purchase.rating }}/5 rated
                </span>
              </div>
            </div>
          </div>
          
          <div *ngIf="purchase.isConfirmed && !purchase.hasBeenReviewed" class="review-section">
            <div class="review-header">
              <span class="review-icon">⭐</span>
              <span>Rate this purchase</span>
            </div>
            <div class="review-form">
              <div class="rating-row">
                <select [(ngModel)]="purchase.reviewRating" class="rating-select">
                  <option value="">Rating</option>
                  <option value="1">★ 1 Star</option>
                  <option value="2">★★ 2 Stars</option>
                  <option value="3">★★★ 3 Stars</option>
                  <option value="4">★★★★ 4 Stars</option>
                  <option value="5">★★★★★ 5 Stars</option>
                </select>
                <button 
                  (click)="submitReview(purchase)" 
                  [disabled]="!purchase.reviewRating"
                  class="btn-submit-review">
                  <span class="btn-icon">✓</span>
                  Submit
                </button>
              </div>
              <textarea 
                [(ngModel)]="purchase.reviewText" 
                placeholder="Share your experience (optional)..."
                class="review-textarea"></textarea>
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
      background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
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

    .purchases-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .purchase-item {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.2s ease;
    }

    .purchase-item:hover {
      border-color: #2196f3;
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.1);
    }

    .purchase-summary {
      padding: 1.25rem;
    }

    .purchase-info {
      width: 100%;
    }

    .purchase-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
    }

    .purchase-icon {
      font-size: 1rem;
    }

    .purchase-id {
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

    .status-badge.confirmed {
      background: #d1edff;
      color: #0c5460;
    }

    .purchase-meta {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.875rem;
      color: #666;
    }

    .meta-icon {
      font-size: 1rem;
    }

    .review-section {
      background: #fff;
      border-top: 1px solid #e9ecef;
      padding: 1.25rem;
    }

    .review-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      font-weight: 600;
      color: #333;
    }

    .review-icon {
      font-size: 1.2rem;
    }

    .review-form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .rating-row {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .rating-select {
      flex: 1;
      padding: 0.5rem 0.75rem;
      border: 2px solid #e9ecef;
      border-radius: 6px;
      font-size: 0.875rem;
      background: white;
    }

    .rating-select:focus {
      outline: none;
      border-color: #2196f3;
    }

    .btn-submit-review {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .btn-submit-review:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }

    .btn-submit-review:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .btn-icon {
      font-size: 1rem;
    }

    .review-textarea {
      padding: 0.75rem;
      border: 2px solid #e9ecef;
      border-radius: 6px;
      font-size: 0.875rem;
      min-height: 80px;
      resize: vertical;
      font-family: inherit;
    }

    .review-textarea:focus {
      outline: none;
      border-color: #2196f3;
    }

    .review-textarea::placeholder {
      color: #999;
    }

    .btn-pay-now {
      padding: 0.5rem 1rem;
      background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .btn-pay-now:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
    }

    @media (max-width: 768px) {
      .purchase-title {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .status-badge {
        margin-left: 0;
        align-self: flex-start;
      }

      .purchase-meta {
        flex-direction: column;
        gap: 0.5rem;
      }

      .rating-row {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class ManagePurchasesComponent implements OnInit {
  purchases: (Purchase & { reviewRating?: number; reviewText?: string; paymentExists?: boolean })[] = [];

  constructor(
    private purchasesService: PurchasesService, 
    private authService: AuthService,
    private purchaseRequestService: PurchaseRequestService,
    private paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.auth$.pipe(
      filter(user => user !== null)
    ).subscribe(currentUser => {
      console.log('Current user:', currentUser);
      const DEALER_TYPE = 2;
      if (currentUser && currentUser.userType === DEALER_TYPE) {
        this.loadPurchases(currentUser.userId);
      } else {
        console.error('Dealer not logged in or invalid user type');
      }
    });
  }

  private loadPurchases(dealerId: number) {
    this.purchasesService.getMyPurchases(dealerId).subscribe({
      next: (purchases) => {
        this.purchases = purchases.map(p => ({ ...p, reviewRating: undefined, reviewText: '', paymentExists: false }));
        
        // Check payment status for each purchase
        this.paymentService.getPaymentsByDealer(dealerId).subscribe({
          next: (payments) => {
            this.purchases.forEach(purchase => {
              purchase.paymentExists = payments.some(p => p.purchaseId === purchase.purchaseId);
            });
          }
        });
      },
      error: (error) => {
        console.error('Error loading purchases:', error);
      }
    });
  }

  submitReview(purchase: Purchase & { reviewRating?: number; reviewText?: string }) {
    if (!purchase.reviewRating) return;

    const review: ReviewRequest = {
      rating: purchase.reviewRating,
      reviewText: purchase.reviewText || ''
    };

    this.purchaseRequestService.submitReview(purchase.purchaseId, review).subscribe({
      next: (response) => {
        alert('Review submitted successfully!');
        purchase.hasBeenReviewed = true;
        purchase.rating = purchase.reviewRating;
      },
      error: (error) => {
        console.error('Error submitting review:', error);
        alert('Failed to submit review');
      }
    });
  }

  trackByPurchaseId(index: number, purchase: Purchase): number {
    return purchase.purchaseId;
  }

  initiatePayment(purchaseId: number) {
    this.router.navigate(['/payment', purchaseId]);
  }
}
