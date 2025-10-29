import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FarmerService } from '../../services/farmer.service';
import { Farmer, Crop, CropPurchase } from '../../models/interfaces';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-farmer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Welcome, {{farmerDetails?.farmerName}}</h1>
        <div class="header-buttons">
          <button class="manage-crops-btn" routerLink="/farmer/manage-crops">Manage Crops</button>
          <button class="logout-btn" (click)="logout()">Logout</button>
        </div>
      </header>

      <div class="dashboard-grid">
        <!-- Farmer Profile Card -->
        <div class="dashboard-card profile-card">
          <h2>Farmer Profile</h2>
          <div class="profile-details" *ngIf="farmerDetails">
            <div class="detail-item">
              <span class="label">Name:</span>
              <span class="value">{{farmerDetails.farmerName}}</span>
            </div>
            <div class="detail-item">
              <span class="label">Email:</span>
              <span class="value">{{farmerDetails.emailAddressFarmer}}</span>
            </div>
            <div class="detail-item">
              <span class="label">Phone:</span>
              <span class="value">{{farmerDetails.farmerPhoneNumber}}</span>
            </div>
            <div class="detail-item">
              <span class="label">Location:</span>
              <span class="value">{{farmerDetails.farmerLocation}}</span>
            </div>
            <div class="detail-item">
              <span class="label">Bank Account:</span>
              <span class="value">{{farmerDetails.farmerBankAccount}}</span>
            </div>
            <div class="detail-item">
              <span class="label">IFSC Code:</span>
              <span class="value">{{farmerDetails.farmerIFSCCode}}</span>
            </div>
            <div class="detail-item">
              <span class="label">Subscribers:</span>
              <span class="value">{{farmerDetails.subscriberCount}}</span>
            </div>
          </div>
        </div>

        <!-- Crops List Card -->
        <div class="dashboard-card">
          <h2>My Crops</h2>
          <div class="crops-grid">
            <div class="crop-card" *ngFor="let crop of crops">
              <h3>{{crop.cropName}}</h3>
              <div class="crop-details">
                <p><strong>Type:</strong> {{crop.cropType}}</p>
                <p><strong>Quantity:</strong> {{crop.quantityInKg}} kg</p>
                <p><strong>Price:</strong> ₹{{crop.pricePerUnit}}/unit</p>
                <p><strong>Location:</strong> {{crop.location}}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Purchases Card -->
        <div class="dashboard-card">
          <h2>Recent Purchase Requests</h2>
          <div class="purchases-list">
            <div class="purchase-item" *ngFor="let purchase of recentPurchases">
              <div class="purchase-header">
                <span class="purchase-id">Order #{{purchase.purchaseId}}</span>
                <span [class]="'status ' + (purchase.isConfirmed ? 'confirmed' : 'pending')">
                  {{purchase.isConfirmed ? 'Confirmed' : 'Pending'}}
                </span>
              </div>
              <div class="purchase-details">
                <p><strong>Crop:</strong> {{purchase.crop?.cropName}}</p>
                <p><strong>Quantity:</strong> {{purchase.quantityRequested}} kg</p>
                <p><strong>Date:</strong> {{purchase.requestedAt | date:'medium'}}</p>
                <p><strong>Dealer:</strong> {{purchase.dealer?.dealerName}}</p>
                <p><strong>Dealer Location:</strong> {{purchase.dealer?.dealerLocation}}</p>
                <div class="review" *ngIf="purchase.hasBeenReviewed">
                  <p><strong>Rating:</strong> {{purchase.rating}}/5</p>
                  <p><strong>Review:</strong> {{purchase.reviewText}}</p>
                </div>
              </div>
            </div>
          </div>
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

    .header-buttons {
      display: flex;
      gap: 10px;
    }

    .manage-crops-btn {
      padding: 8px 16px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .manage-crops-btn:hover {
      background-color: #388e3c;
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

    .profile-card {
      .detail-item {
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
    }

    .crops-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .crop-card {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      
      h3 {
        margin: 0 0 10px 0;
        color: #2e7d32;
      }

      .crop-details p {
        margin: 5px 0;
      }
    }

    .purchases-list {
      .purchase-item {
        border-bottom: 1px solid #eee;
        padding: 15px 0;

        &:last-child {
          border-bottom: none;
        }
      }

      .purchase-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
      }

      .status {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.875rem;

        &.confirmed {
          background: #e8f5e9;
          color: #2e7d32;
        }

        &.pending {
          background: #fff3e0;
          color: #f57c00;
        }
      }

      .review {
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px dashed #eee;
      }
    }

    @media (max-width: 768px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }

      .crops-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class FarmerDashboardComponent implements OnInit {
  farmerDetails: Farmer | null = null;
  crops: Crop[] = [];
  recentPurchases: CropPurchase[] = [];

  constructor(
    private farmerService: FarmerService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadFarmerDetails();
  }

  private loadFarmerDetails() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.farmerService.getFarmerProfile().subscribe({
      next: (farmer) => {
        this.farmerDetails = farmer;
        this.loadCrops(farmer.farmerId);
        this.loadPurchases(farmer.farmerId);
      },
      error: (error) => {
        console.error('Error loading farmer details:', error);
      }
    });
  }

  private loadCrops(farmerId: number) {
    this.farmerService.getFarmerCrops(farmerId).subscribe({
      next: (crops) => {
        this.crops = crops;
      },
      error: (error) => {
        console.error('Error loading crops:', error);
      }
    });
  }

  private loadPurchases(farmerId: number) {
    this.farmerService.getCropPurchases(farmerId).subscribe({
      next: (purchases) => {
        this.recentPurchases = purchases;
      },
      error: (error) => {
        console.error('Error loading purchases:', error);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
