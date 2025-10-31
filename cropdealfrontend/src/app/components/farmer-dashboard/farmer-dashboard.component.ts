import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FarmerService } from '../../services/farmer.service';
import { Farmer, Crop, CropPurchase } from '../../models/interfaces';
import { AuthService } from '../../services/auth.service';
import { ManagePurchaseRequestsComponent } from '../manage-purchase-requests/manage-purchase-requests.component';
import { PaymentCardsFarmerComponent } from '../payment-cards-farmer/payment-cards-farmer.component';

@Component({
  selector: 'app-farmer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ManagePurchaseRequestsComponent, PaymentCardsFarmerComponent],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="header-gradient"></div>
        <div class="header-content">
          <div class="welcome-section">
            <div class="avatar-wrapper">
              <div class="avatar">
                <i class="material-icons">person</i>
              </div>
              <div class="status-indicator"></div>
            </div>
            <div class="welcome-text">
              <h1>Welcome back, {{farmerDetails?.farmerName || 'Farmer'}}!</h1>
              <p class="subtitle">
                <i class="material-icons">location_on</i>
                {{farmerDetails?.farmerLocation || 'Location'}}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div class="stats-section">
        <div class="stat-card stat-primary">
          <div class="stat-icon-wrapper">
            <div class="stat-icon">
              <i class="material-icons">agriculture</i>
            </div>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{crops.length}}</div>
            <div class="stat-label">Active Crops</div>
            <div class="stat-trend">
              <i class="material-icons">trending_up</i>
              <span>View All</span>
            </div>
          </div>
        </div>

        <div class="stat-card stat-success">
          <div class="stat-icon-wrapper">
            <div class="stat-icon">
              <i class="material-icons">shopping_cart</i>
            </div>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{recentPurchases.length}}</div>
            <div class="stat-label">Purchase Requests</div>
            <div class="stat-trend">
              <i class="material-icons">notifications</i>
              <span>{{getPendingCount()}} Pending</span>
            </div>
          </div>
        </div>

        <div class="stat-card stat-info">
          <div class="stat-icon-wrapper">
            <div class="stat-icon">
              <i class="material-icons">people</i>
            </div>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{farmerDetails?.subscriberCount || 0}}</div>
            <div class="stat-label">Subscribers</div>
            <div class="stat-trend">
              <i class="material-icons">favorite</i>
              <span>Following You</span>
            </div>
          </div>
        </div>

        <div class="stat-card stat-warning">
          <div class="stat-icon-wrapper">
            <div class="stat-icon">
              <i class="material-icons">verified</i>
            </div>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{farmerDetails?.isVerified ? 'Yes' : 'No'}}</div>
            <div class="stat-label">Verified Status</div>
            <div class="stat-trend">
              <i class="material-icons">{{farmerDetails?.isVerified ? 'check_circle' : 'pending'}}</i>
              <span>{{farmerDetails?.isVerified ? 'Verified' : 'Pending'}}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <div class="main-content">
          <div class="card crops-showcase">
            <div class="card-header">
              <div class="header-left">
                <i class="material-icons">eco</i>
                <h2>My Crops</h2>
              </div>
              <button class="btn btn-sm btn-primary" routerLink="/farmer/manage-crops">
                <i class="material-icons">add</i>
                Add New
              </button>
            </div>
            <div class="card-body">
              <div class="crops-grid" *ngIf="crops.length > 0; else noCrops">
                <div class="crop-card" *ngFor="let crop of crops">
                  <div class="crop-image">
                    <i class="material-icons">spa</i>
                  </div>
                  <div class="crop-content">
                    <div class="crop-header">
                      <h3>{{crop.cropName}}</h3>
                      <span class="crop-type-badge">{{crop.cropType}}</span>
                    </div>
                    <div class="crop-info">
                      <div class="info-item">
                        <i class="material-icons">scale</i>
                        <span>{{crop.quantityInKg}} kg</span>
                      </div>
                      <div class="info-item">
                        <i class="material-icons">currency_rupee</i>
                        <span>₹{{crop.pricePerUnit}}/unit</span>
                      </div>
                      <div class="info-item">
                        <i class="material-icons">location_on</i>
                        <span>{{crop.location}}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <ng-template #noCrops>
                <div class="empty-state">
                  <div class="empty-icon">
                    <i class="material-icons">agriculture</i>
                  </div>
                  <h3>No crops listed yet</h3>
                  <p>Start by adding your first crop to the marketplace</p>
                  <button class="btn btn-primary" routerLink="/farmer/manage-crops">
                    <i class="material-icons">add_circle</i>
                    Add Your First Crop
                  </button>
                </div>
              </ng-template>
            </div>
          </div>

          <div class="card">
            <app-manage-purchase-requests></app-manage-purchase-requests>
          </div>

          <div class="card">
            <app-payment-cards-farmer></app-payment-cards-farmer>
          </div>
        </div>

        <div class="sidebar">
          <div class="card profile-card">
            <div class="card-header">
              <div class="header-left">
                <i class="material-icons">account_circle</i>
                <h2>Profile</h2>
              </div>
              <button class="btn-icon" routerLink="/farmer/profile">
                <i class="material-icons">edit</i>
              </button>
            </div>
            <div class="card-body">
              <div class="profile-info" *ngIf="farmerDetails">
                <div class="info-row">
                  <div class="info-icon">
                    <i class="material-icons">email</i>
                  </div>
                  <div class="info-text">
                    <span class="label">Email</span>
                    <span class="value">{{farmerDetails.emailAddressFarmer}}</span>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-icon">
                    <i class="material-icons">phone</i>
                  </div>
                  <div class="info-text">
                    <span class="label">Phone</span>
                    <span class="value">{{farmerDetails.farmerPhoneNumber}}</span>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-icon">
                    <i class="material-icons">account_balance</i>
                  </div>
                  <div class="info-text">
                    <span class="label">Bank Account</span>
                    <span class="value">{{farmerDetails.farmerBankAccount}}</span>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-icon">
                    <i class="material-icons">code</i>
                  </div>
                  <div class="info-text">
                    <span class="label">IFSC Code</span>
                    <span class="value">{{farmerDetails.farmerIFSCCode}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card activity-card">
            <div class="card-header">
              <div class="header-left">
                <i class="material-icons">history</i>
                <h2>Recent Activity</h2>
              </div>
            </div>
            <div class="card-body">
              <div class="activity-list" *ngIf="recentPurchases.length > 0; else noActivity">
                <div class="activity-item" *ngFor="let purchase of recentPurchases.slice(0, 5)">
                  <div class="activity-icon" [class.confirmed]="purchase.isConfirmed">
                    <i class="material-icons">{{purchase.isConfirmed ? 'check_circle' : 'pending'}}</i>
                  </div>
                  <div class="activity-content">
                    <div class="activity-title">{{purchase.crop?.cropName}}</div>
                    <div class="activity-meta">
                      <span>{{purchase.quantityRequested}} kg</span>
                      <span>•</span>
                      <span>{{purchase.requestedAt | date:'short'}}</span>
                    </div>
                  </div>
                </div>
              </div>
              <ng-template #noActivity>
                <div class="empty-state-small">
                  <i class="material-icons">inbox</i>
                  <p>No recent activity</p>
                </div>
              </ng-template>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 1.5rem;
    }

    .dashboard-header {
      position: relative;
      background: white;
      border-radius: 1.5rem;
      box-shadow: 0 10px 40px rgba(0,0,0,0.08);
      margin-bottom: 2rem;
      overflow: hidden;
    }

    .header-gradient {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 200px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      opacity: 0.9;
    }

    .header-content {
      position: relative;
      padding: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }

    .welcome-section {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .avatar-wrapper {
      position: relative;
    }

    .avatar {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
      border: 4px solid white;
    }

    .avatar i {
      color: white;
      font-size: 2.5rem;
    }

    .status-indicator {
      position: absolute;
      bottom: 5px;
      right: 5px;
      width: 16px;
      height: 16px;
      background: #10b981;
      border: 3px solid white;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }

    .welcome-text h1 {
      color: white;
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .subtitle {
      color: rgba(255,255,255,0.95);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
      font-size: 1rem;
    }

    .subtitle i {
      font-size: 1.2rem;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 0.75rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.95rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
    }

    .btn-outline {
      background: white;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .btn-outline:hover {
      background: #667eea;
      color: white;
    }

    .btn-outline-danger {
      background: white;
      color: #ef4444;
      border: 2px solid #ef4444;
    }

    .btn-outline-danger:hover {
      background: #ef4444;
      color: white;
    }

    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 1.25rem;
      padding: 1.75rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      transition: width 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    }

    .stat-card:hover::before {
      width: 100%;
      opacity: 0.05;
    }

    .stat-primary::before { background: #667eea; }
    .stat-success::before { background: #10b981; }
    .stat-info::before { background: #3b82f6; }
    .stat-warning::before { background: #f59e0b; }

    .stat-icon-wrapper {
      position: relative;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .stat-primary .stat-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .stat-success .stat-icon {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .stat-info .stat-icon {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    }

    .stat-warning .stat-icon {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }

    .stat-icon i {
      color: white;
      font-size: 1.75rem;
    }

    .stat-content {
      flex: 1;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      line-height: 1;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: #6b7280;
      font-size: 0.95rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    .stat-trend {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: #9ca3af;
      font-size: 0.85rem;
    }

    .stat-trend i {
      font-size: 1rem;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 2rem;
    }

    .main-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .card {
      background: white;
      border-radius: 1.25rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      overflow: hidden;
    }

    .card-header {
      padding: 1.5rem;
      border-bottom: 1px solid #f3f4f6;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .header-left i {
      color: #667eea;
      font-size: 1.5rem;
    }

    .card-header h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    .btn-icon {
      width: 36px;
      height: 36px;
      border-radius: 0.5rem;
      border: none;
      background: #f3f4f6;
      color: #6b7280;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .btn-icon:hover {
      background: #667eea;
      color: white;
    }

    .card-body {
      padding: 1.5rem;
    }

    .crops-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .crop-card {
      background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
      border: 2px solid #f3f4f6;
      border-radius: 1rem;
      overflow: hidden;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .crop-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
      border-color: #667eea;
    }

    .crop-image {
      height: 120px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .crop-image i {
      font-size: 3rem;
      color: white;
      opacity: 0.9;
    }

    .crop-content {
      padding: 1.25rem;
    }

    .crop-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .crop-header h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    .crop-type-badge {
      background: #ede9fe;
      color: #7c3aed;
      padding: 0.25rem 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .crop-info {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .info-item i {
      color: #667eea;
      font-size: 1.1rem;
    }

    .profile-info {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 0.75rem;
      transition: all 0.2s ease;
    }

    .info-row:hover {
      background: #f3f4f6;
    }

    .info-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .info-icon i {
      color: white;
      font-size: 1.2rem;
    }

    .info-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-text .label {
      font-size: 0.8rem;
      color: #9ca3af;
      font-weight: 500;
    }

    .info-text .value {
      font-size: 0.95rem;
      color: #1f2937;
      font-weight: 600;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 0.75rem;
      transition: all 0.2s ease;
    }

    .activity-item:hover {
      background: #f3f4f6;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      background: #fef3c7;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .activity-icon.confirmed {
      background: #d1fae5;
    }

    .activity-icon i {
      color: #f59e0b;
      font-size: 1.2rem;
    }

    .activity-icon.confirmed i {
      color: #10b981;
    }

    .activity-content {
      flex: 1;
    }

    .activity-title {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.25rem;
    }

    .activity-meta {
      font-size: 0.85rem;
      color: #9ca3af;
      display: flex;
      gap: 0.5rem;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }

    .empty-icon i {
      font-size: 2.5rem;
      color: #9ca3af;
    }

    .empty-state h3 {
      color: #1f2937;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: #6b7280;
      margin-bottom: 1.5rem;
    }

    .empty-state-small {
      text-align: center;
      padding: 2rem;
      color: #9ca3af;
    }

    .empty-state-small i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    @media (max-width: 1200px) {
      .content-grid {
        grid-template-columns: 1fr;
      }

      .sidebar {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
      }
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .header-content {
        flex-direction: column;
        text-align: center;
      }

      .welcome-section {
        flex-direction: column;
      }

      .header-actions {
        width: 100%;
        flex-direction: column;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }

      .stats-section {
        grid-template-columns: 1fr;
      }

      .crops-grid {
        grid-template-columns: 1fr;
      }

      .sidebar {
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

  getPendingCount(): number {
    return this.recentPurchases.filter(p => !p.isConfirmed).length;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  trackByPurchaseId(index: number, purchase: CropPurchase): number {
    return purchase.purchaseId;
  }
}
