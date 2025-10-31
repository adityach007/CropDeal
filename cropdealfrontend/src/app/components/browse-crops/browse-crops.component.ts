import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CropsService } from '../../services/crops.service';
import { CropPurchaseService } from '../../services/crop-purchase.service';
import { PaymentService } from '../../services/payment.service';
import { Crop, CropPurchase, Payment } from '../../models/interfaces';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-browse-crops',
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule, MatTabsModule, MatDialogModule, FormsModule],
  template: `
    <div class="browse-container">
      <header class="page-header">
        <h1>Dealer Dashboard</h1>
        <div>
          <button class="marketplace-btn" (click)="showMarketplace = true">Marketplace</button>
          <button class="back-btn" routerLink="/dealer/dashboard">Back to Dashboard</button>
        </div>
      </header>

      <ng-container *ngIf="showMarketplace; else purchasesTabs">
        <h2>Marketplace</h2>
        <div class="crops-grid">
          <div class="crop-card" *ngFor="let crop of availableCrops">
            <div class="crop-header">
              <h3>{{crop.cropName}}</h3>
              <span class="crop-type">{{crop.cropType}}</span>
            </div>
            <div class="crop-details">
              <p><strong>Quantity Available:</strong> {{crop.quantityInKg}} kg</p>
              <p><strong>Price:</strong> ₹{{crop.pricePerUnit}}/kg</p>
              <p><strong>Location:</strong> {{crop.location}}</p>
            </div>
            <!-- Add more crop info/actions here if needed -->
          </div>
        </div>
        <div class="no-crops" *ngIf="availableCrops.length === 0">
          <p>No crops available in the marketplace.</p>
        </div>
        <button class="back-btn" (click)="showMarketplace = false">Back to Purchases</button>
      </ng-container>

      <ng-template #purchasesTabs>
        <mat-tab-group (selectedTabChange)="onTabChange($event)">
          <mat-tab label="My Purchases">
            <div class="loading-spinner" *ngIf="loadingPurchases">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
            <div class="crops-grid" *ngIf="!loadingPurchases">
              <div class="crop-card" *ngFor="let purchase of purchasedCrops">
                <div class="crop-header">
                  <h3>{{purchase.crop?.cropName}}</h3>
                  <span class="crop-type">{{purchase.crop?.cropType}}</span>
                </div>
                <div class="crop-details">
                  <p><strong>Quantity:</strong> {{purchase.quantityRequested}} kg</p>
                  <p><strong>Price:</strong> ₹{{purchase.crop?.pricePerUnit}}/kg</p>
                  <p><strong>Location:</strong> {{purchase.crop?.location}}</p>
                  <p><strong>Total Price:</strong> ₹{{getTotalPrice(purchase)}}</p>
                  <p><strong>Status:</strong> <span [class]="'status ' + (purchase.isConfirmed ? 'confirmed' : 'pending')">
                    {{purchase.isConfirmed ? 'Confirmed' : 'Pending'}}
                  </span></p>
                </div>
                <div class="purchase-actions">
                  <button class="review-btn" *ngIf="canReview(purchase)" (click)="openReviewDialog(purchase)">Write Review</button>
                  <div class="review-details" *ngIf="purchase.hasBeenReviewed">
                    <div class="rating">
                      <span><strong>Rating:</strong></span>
                      <span class="stars">
                        <span *ngFor="let star of [1,2,3,4,5]" [class.filled]="star <= (purchase.rating || 0)">★</span>
                      </span>
                    </div>
                    <p><strong>Review:</strong> {{purchase.reviewText}}</p>
                    <p class="review-date">Reviewed on: {{purchase.reviewDate | date:'mediumDate'}}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="no-crops" *ngIf="!loadingPurchases && purchasedCrops.length === 0">
              <p>No purchased crops yet.</p>
            </div>
          </mat-tab>
        </mat-tab-group>
      </ng-template>
      <ng-template #loadingTabs>
        <div class="loading-spinner">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    .mat-tab-group {
      margin-top: var(--spacing-xl);
      background: white;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-md);
      overflow: hidden;
    }

    .browse-container {
      padding: var(--spacing-lg);
      max-width: 1400px;
      margin: 0 auto;
      min-height: 100vh;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-2xl);
      padding: var(--spacing-2xl);
      background: white;
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-lg);
      background: linear-gradient(135deg, var(--primary-50), white);
    }

    h1 {
      color: var(--gray-900);
      margin: 0;
      font-size: var(--font-size-3xl);
    }

    h2 {
      color: var(--gray-900);
      margin-bottom: var(--spacing-xl);
      font-size: var(--font-size-2xl);
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    h2 i {
      color: var(--primary-600);
    }

    .crops-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--spacing-xl);
      padding: var(--spacing-xl);
    }

    .crop-card {
      background: white;
      border-radius: var(--radius-2xl);
      padding: var(--spacing-xl);
      box-shadow: var(--shadow-md);
      display: flex;
      flex-direction: column;
      border: 2px solid var(--gray-200);
      transition: all var(--transition-normal);
      position: relative;
      overflow: hidden;
    }

    .crop-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
    }

    .crop-card:hover {
      transform: translateY(-8px);
      box-shadow: var(--shadow-xl);
      border-color: var(--primary-300);
    }

    .crop-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--spacing-lg);
    }

    .crop-header h3 {
      margin: 0;
      color: var(--gray-900);
      font-size: var(--font-size-xl);
      font-weight: 600;
    }

    .crop-type {
      background: var(--primary-100);
      color: var(--primary-800);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-xs);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .crop-details {
      flex-grow: 1;
      margin-bottom: var(--spacing-lg);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .crop-details p {
      margin: 0;
      color: var(--gray-700);
      font-size: var(--font-size-base);
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .crop-details strong {
      color: var(--gray-900);
      font-weight: 600;
    }

    .status {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-xs);
      font-weight: 500;
      text-transform: uppercase;
    }

    .status.confirmed {
      background: var(--primary-100);
      color: var(--primary-800);
    }

    .status.pending {
      background: #fff3e0;
      color: #e65100;
    }

    .review-btn {
      width: 100%;
      padding: var(--spacing-md) var(--spacing-lg);
      background: linear-gradient(135deg, var(--secondary-500), var(--secondary-600));
      color: white;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
      margin-bottom: var(--spacing-md);
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
    }

    .review-btn:hover {
      background: linear-gradient(135deg, var(--secondary-600), var(--secondary-700));
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .review-details {
      background: var(--gray-50);
      padding: var(--spacing-lg);
      border-radius: var(--radius-md);
      margin-top: var(--spacing-md);
      border-left: 4px solid var(--secondary-500);
    }

    .rating {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
    }

    .stars {
      display: flex;
      gap: var(--spacing-xs);
    }

    .stars span {
      color: var(--gray-300);
      font-size: 1.2rem;
      transition: color var(--transition-fast);
    }

    .stars span.filled {
      color: #ffd700;
    }

    .review-date {
      font-size: var(--font-size-sm);
      color: var(--gray-600);
      margin-top: var(--spacing-sm);
      font-style: italic;
    }

    .no-crops {
      text-align: center;
      color: var(--gray-600);
      padding: var(--spacing-3xl);
    }

    .no-crops p {
      font-size: var(--font-size-lg);
      margin: 0;
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: var(--spacing-3xl);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .browse-container {
        padding: var(--spacing-md);
      }

      .page-header {
        flex-direction: column;
        gap: var(--spacing-lg);
        text-align: center;
      }

      .crops-grid {
        grid-template-columns: 1fr;
        padding: var(--spacing-md);
      }

      .crop-header {
        flex-direction: column;
        gap: var(--spacing-md);
        align-items: flex-start;
      }
    }
  `]
})
export class BrowseCropsComponent implements OnInit {
  availableCrops: Crop[] = [];
  purchasedCrops: CropPurchase[] = [];
  payments: Map<number, Payment> = new Map();
  loading = true;
  loadingPurchases = true;
  showMarketplace = false;

  constructor(
    private cropsService: CropsService,
    private cropPurchaseService: CropPurchaseService,
    private paymentService: PaymentService,
    private authService: AuthService,
    private dialog: MatDialog,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadPurchasedCrops();
    this.loadMarketplaceCrops();
  }

  private loadMarketplaceCrops() {
    this.cropsService.getAllCrops().subscribe({
      next: (crops: Crop[]) => {
        this.availableCrops = crops;
      },
      error: (error: any) => {
        console.error('Error loading marketplace crops:', error);
      }
    });
  }

  private loadPurchasedCrops() {
    this.loadingPurchases = true;
    const currentUser = this.authService.getCurrentUser();
    const dealerId = currentUser?.userId;
    
    if (dealerId) {
      this.cropPurchaseService.getDealerPurchases(dealerId).subscribe({
        next: (purchases: CropPurchase[]) => {
          this.purchasedCrops = purchases;
          this.loadPaymentDetails(purchases);
          this.loadingPurchases = false;
        },
        error: (error: any) => {
          console.error('Error loading purchases:', error);
          this.loadingPurchases = false;
        }
      });
    }
  }

  private loadPaymentDetails(purchases: CropPurchase[]) {
    purchases.forEach(purchase => {
      this.paymentService.getPaymentsByCrop(purchase.cropId).subscribe({
        next: (payments: Payment[]) => {
          if (payments.length > 0) {
            this.payments.set(purchase.cropId, payments[0]);
          }
        },
        error: (error: any) => {
          console.error(`Error loading payment for crop ${purchase.cropId}:`, error);
        }
      });
    });
  }

  getPaymentStatus(cropId: number): string {
    const payment = this.payments.get(cropId);
    return payment ? payment.transactionStatus : 'Not Found';
  }

  canReview(purchase: CropPurchase): boolean {
    if (!purchase.isConfirmed || purchase.hasBeenReviewed) {
      return false;
    }
    const payment = this.payments.get(purchase.cropId);
    return payment ? payment.canBeReviewed : false;
  }

  openReviewDialog(purchase: CropPurchase) {
    // Implement review dialog logic
    const review = {
      rating: 5,
      reviewText: ''
    };

    // For now, just submit the review directly
    this.cropPurchaseService.submitReview(purchase.purchaseId, review).subscribe({
      next: () => {
        this.loadPurchasedCrops();
        this.toast.success('Review submitted successfully!');
      },
      error: (error: any) => {
        console.error('Error submitting review:', error);
        this.toast.error('Failed to submit review');
      }
    });
  }

  // Safely calculate total price for a purchase
  getTotalPrice(purchase: CropPurchase): number {
    if (!purchase || !purchase.crop || purchase.quantityRequested == null || purchase.crop.pricePerUnit == null) {
      return 0;
    }
    return purchase.quantityRequested * purchase.crop.pricePerUnit;
  }

  onTabChange(event: any) {
    // Only My Purchases tab remains
    this.loadPurchasedCrops();
  }
}
