import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DealerService } from '../../services/dealer.service';

@Component({
  selector: 'app-dealer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Welcome, {{dealerDetails?.dealerName}}</h1>
        <button class="logout-btn" (click)="logout()">Logout</button>
      </header>

      <div class="dashboard-grid">
        <!-- Dealer Profile Card -->
        <div class="dashboard-card profile-card">
          <h2>Dealer Profile</h2>
          <div class="profile-details" *ngIf="dealerDetails">
            <div class="detail-item">
              <span class="label">Name:</span>
              <span class="value">{{dealerDetails.dealerName}}</span>
            </div>
            <div class="detail-item">
              <span class="label">Email:</span>
              <span class="value">{{dealerDetails.dealerEmailAddress}}</span>
            </div>
            <div class="detail-item">
              <span class="label">Phone:</span>
              <span class="value">{{dealerDetails.dealerPhoneNumber}}</span>
            </div>
            <div class="detail-item">
              <span class="label">Location:</span>
              <span class="value">{{dealerDetails.dealerLocation}}</span>
            </div>
            <div class="detail-item">
              <span class="label">Bank Account:</span>
              <span class="value">{{dealerDetails.dealerBankAccount}}</span>
            </div>
            <div class="detail-item">
              <span class="label">IFSC Code:</span>
              <span class="value">{{dealerDetails.dealerIFSCode}}</span>
            </div>
          </div>
        </div>

        <!-- Purchase History Card -->
        <div class="dashboard-card">
          <h2>Purchase History</h2>
          <div class="purchase-history" *ngIf="purchases.length > 0; else noPurchases">
            <div class="purchase-item" *ngFor="let purchase of purchases">
              <div class="purchase-header">
                <h3>Purchase #{{purchase.purchaseId}}</h3>
                <span [class]="'status ' + (purchase.isConfirmed ? 'confirmed' : 'pending')">
                  {{purchase.isConfirmed ? 'Confirmed' : 'Pending'}}
                </span>
              </div>
              <div class="purchase-details">
                <p><strong>Crop:</strong> {{purchase.crop?.cropName}}</p>
                <p><strong>Quantity:</strong> {{purchase.quantityRequested}} kg</p>
                <p><strong>Date:</strong> {{purchase.requestedAt | date:'medium'}}</p>
                <div class="review" *ngIf="purchase.isConfirmed && !purchase.hasBeenReviewed">
                  <button class="review-btn" (click)="submitReview(purchase)">Write Review</button>
                </div>
                <div class="review" *ngIf="purchase.hasBeenReviewed">
                  <p><strong>Your Rating:</strong> {{purchase.rating}}/5</p>
                  <p><strong>Your Review:</strong> {{purchase.reviewText}}</p>
                </div>
              </div>
            </div>
          </div>
          <ng-template #noPurchases>
            <p class="no-data">No purchase history available</p>
          </ng-template>
        </div>

        <!-- Subscribed Farmers Card -->
        <div class="dashboard-card">
          <h2>Subscribed Farmers</h2>
          <div class="farmers-list" *ngIf="subscribedFarmers.length > 0; else noFarmers">
            <div class="farmer-item" *ngFor="let subscription of subscribedFarmers">
              <div class="farmer-header">
                <h3>{{subscription.farmerName}}</h3>
                <button class="unsubscribe-btn" (click)="unsubscribeFromFarmer(subscription.farmerId)">
                  Unsubscribe
                </button>
              </div>
              <div class="farmer-details">
                <p><strong>Location:</strong> {{subscription.location}}</p>
                <p><strong>Subscribed Since:</strong> {{subscription.subscribedDate | date:'mediumDate'}}</p>
              </div>
            </div>
          </div>
          <ng-template #noFarmers>
            <p class="no-data">No subscribed farmers</p>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding: 20px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    h1 {
      color: #2e7d32;
      margin: 0;
    }

    .logout-btn {
      padding: 8px 16px;
      background-color: #ff5722;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .logout-btn:hover {
      background-color: #f4511e;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .dashboard-card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    h2 {
      color: #2e7d32;
      margin-bottom: 20px;
      font-size: 1.5rem;
    }

    .profile-card .detail-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }

    .label {
      color: #666;
      font-weight: 500;
    }

    .value {
      color: #333;
    }

    .purchase-item, .farmer-item {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
    }

    .purchase-header, .farmer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .status.confirmed {
      background-color: #c8e6c9;
      color: #2e7d32;
    }

    .status.pending {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .purchase-details, .farmer-details {
      color: #555;
      font-size: 0.9rem;
    }

    .review-btn {
      padding: 6px 12px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 10px;
    }

    .review-btn:hover {
      background-color: #388e3c;
    }

    .unsubscribe-btn {
      padding: 6px 12px;
      background-color: #ff5722;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .unsubscribe-btn:hover {
      background-color: #f4511e;
    }

    .no-data {
      color: #666;
      text-align: center;
      font-style: italic;
    }

    @media (max-width: 768px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DealerDashboardComponent implements OnInit {
  dealerDetails: any = null;
  dealerId: number | null = null;
  purchases: any[] = [];
  subscribedFarmers: any[] = [];

  constructor(
    private dealerService: DealerService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.dealerId = currentUser.userId;
    this.loadDealerDetails();
    this.loadPurchases();
    this.loadSubscribedFarmers();
  }

  private loadDealerDetails() {

    this.dealerService.getDealerProfile().subscribe({
      next: (dealer) => {
        this.dealerDetails = dealer;
      },
      error: (error) => {
        console.error('Error loading dealer details:', error);
      }
    });
  }

  private loadPurchases() {
    if (this.dealerId) {
      this.dealerService.getDealerPurchases(this.dealerId).subscribe({
        next: (purchases) => {
          this.purchases = purchases;
        },
        error: (error) => {
          console.error('Error loading purchases:', error);
        }
      });
    }
  }

  private loadSubscribedFarmers() {
    this.dealerService.getSubscribedFarmers().subscribe({
      next: (farmers) => {
        this.subscribedFarmers = farmers;
      },
      error: (error) => {
        console.error('Error loading subscribed farmers:', error);
      }
    });
  }

  submitReview(purchase: any) {
    // This would open a modal or navigate to a review form
    console.log('Submit review for purchase:', purchase);
  }

  unsubscribeFromFarmer(farmerId: number) {
    this.dealerService.unsubscribeFromFarmer(farmerId).subscribe({
      next: () => {
        this.loadSubscribedFarmers(); // Reload the subscriptions
      },
      error: (error) => {
        console.error('Error unsubscribing from farmer:', error);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
