import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../services/auth.service';
import { DealerService, Dealer } from '../../services/dealer.service';
import { CropsService } from '../../services/crops.service';
import { PurchasesService } from '../../services/purchases.service';
import { PaymentService } from '../../services/payment.service';
import { ManagePurchasesComponent } from '../manage-purchases/manage-purchases.component';
import { AvailableCropsComponent } from '../available-crops/available-crops.component';
import { SubscribedFarmersComponent } from '../subscribed-farmers/subscribed-farmers.component';

@Component({
  selector: 'app-dealer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ManagePurchasesComponent,
    AvailableCropsComponent,
    SubscribedFarmersComponent
  ],
  styleUrls: ['./dealer-dashboard.component.css'],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="header-gradient"></div>
        <div class="header-content">
          <div class="welcome-section">
            <div class="avatar-wrapper">
              <div class="avatar">
                <i class="material-icons">business</i>
              </div>
              <div class="status-indicator"></div>
            </div>
            <div class="welcome-text">
              <h1>Welcome back, {{dealerDetails?.dealerName || 'Dealer'}}!</h1>
              <p class="subtitle">
                <i class="material-icons">location_on</i>
                {{dealerDetails?.dealerLocation || 'Location'}}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div class="stats-section">
        <div class="stat-card stat-primary">
          <div class="stat-icon-wrapper">
            <div class="stat-icon">
              <i class="material-icons">shopping_cart</i>
            </div>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{getTotalPurchases()}}</div>
            <div class="stat-label">Total Purchases</div>
            <div class="stat-trend">
              <i class="material-icons">trending_up</i>
              <span>View All</span>
            </div>
          </div>
        </div>

        <div class="stat-card stat-success">
          <div class="stat-icon-wrapper">
            <div class="stat-icon">
              <i class="material-icons">payment</i>
            </div>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{getTotalPayments()}}</div>
            <div class="stat-label">Payment Records</div>
            <div class="stat-trend">
              <i class="material-icons">receipt</i>
              <span>Transactions</span>
            </div>
          </div>
        </div>

        <div class="stat-card stat-info">
          <div class="stat-icon-wrapper">
            <div class="stat-icon">
              <i class="material-icons">agriculture</i>
            </div>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{getAvailableCrops()}}</div>
            <div class="stat-label">Available Crops</div>
            <div class="stat-trend">
              <i class="material-icons">eco</i>
              <span>In Market</span>
            </div>
          </div>
        </div>

        <div class="stat-card stat-warning">
          <div class="stat-icon-wrapper">
            <div class="stat-icon">
              <i class="material-icons">people</i>
            </div>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{dealerDetails?.isDealerIdActive ? 'Active' : 'Inactive'}}</div>
            <div class="stat-label">Account Status</div>
            <div class="stat-trend">
              <i class="material-icons">{{dealerDetails?.isDealerIdActive ? 'check_circle' : 'pending'}}</i>
              <span>{{dealerDetails?.isDealerIdActive ? 'Verified' : 'Pending'}}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <div class="main-content">
          <div class="card">
            <app-available-crops></app-available-crops>
          </div>

          <div class="card">
            <app-manage-purchases></app-manage-purchases>
          </div>

          <div class="card">
            <app-subscribed-farmers></app-subscribed-farmers>
          </div>
        </div>

        <div class="sidebar">
          <div class="card profile-card">
            <div class="card-header">
              <div class="header-left">
                <i class="material-icons">account_circle</i>
                <h2>Profile</h2>
              </div>
              <button class="btn-icon" routerLink="/dealer/profile">
                <i class="material-icons">edit</i>
              </button>
            </div>
            <div class="card-body">
              <div class="loading-spinner" *ngIf="loading.profile">
                <mat-spinner diameter="40"></mat-spinner>
              </div>
              <div class="profile-info" *ngIf="!loading.profile && dealerDetails">
                <div class="info-row">
                  <div class="info-icon">
                    <i class="material-icons">email</i>
                  </div>
                  <div class="info-text">
                    <span class="label">Email</span>
                    <span class="value">{{dealerDetails.dealerEmailAddress}}</span>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-icon">
                    <i class="material-icons">phone</i>
                  </div>
                  <div class="info-text">
                    <span class="label">Phone</span>
                    <span class="value">{{dealerDetails.dealerPhoneNumber}}</span>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-icon">
                    <i class="material-icons">account_balance</i>
                  </div>
                  <div class="info-text">
                    <span class="label">Bank Account</span>
                    <span class="value">{{dealerDetails.dealerBankAccount}}</span>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-icon">
                    <i class="material-icons">code</i>
                  </div>
                  <div class="info-text">
                    <span class="label">IFSC Code</span>
                    <span class="value">{{dealerDetails.dealerIFSCode}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card quick-actions-card">
            <div class="card-header">
              <div class="header-left">
                <i class="material-icons">flash_on</i>
                <h2>Quick Actions</h2>
              </div>
            </div>
            <div class="card-body">
              <div class="quick-actions">
                <button class="action-btn" routerLink="/dealer/browse-farmers">
                  <i class="material-icons">people</i>
                  <span>View Farmers</span>
                </button>
                <button class="action-btn" routerLink="/dealer/profile">
                  <i class="material-icons">settings</i>
                  <span>Edit Profile</span>
                </button>
              </div>
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
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(240, 147, 251, 0.4);
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
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(240, 147, 251, 0.4);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(240, 147, 251, 0.5);
    }

    .btn-outline {
      background: white;
      color: #f5576c;
      border: 2px solid #f5576c;
    }

    .btn-outline:hover {
      background: #f5576c;
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

    .stat-primary::before { background: #f093fb; }
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
    }

    .stat-primary .stat-icon {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
      color: #f5576c;
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
      background: #f5576c;
      color: white;
    }

    .card-body {
      padding: 1.5rem;
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
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

    .quick-actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border: 2px solid #f3f4f6;
      border-radius: 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;
      font-weight: 600;
      color: #1f2937;
    }

    .action-btn:hover {
      background: #f5576c;
      color: white;
      border-color: #f5576c;
    }

    .action-btn i {
      font-size: 1.5rem;
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 2rem;
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

      .sidebar {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DealerDashboardComponent implements OnInit {
  dealerDetails: any = null;
  loading = { profile: false };
  totalPurchases = 0;
  totalPayments = 0;
  availableCrops = 0;

  constructor(
    private dealerService: DealerService,
    private authService: AuthService,
    private router: Router,
    private cropsService: CropsService,
    private purchasesService: PurchasesService,
    private paymentService: PaymentService
  ) {}

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadDealerDetails();
  }

  private loadDealerDetails() {
    this.loading.profile = true;
    this.dealerService.getDealerProfile().subscribe({
      next: (dealer: any) => {
        this.dealerDetails = dealer;
        this.loading.profile = false;
        this.loadDashboardData();
      },
      error: (error: any) => {
        console.error('Error loading dealer details:', error);
        this.loading.profile = false;
      }
    });
  }

  private loadDashboardData() {
    this.cropsService.getAllCrops().subscribe({
      next: (crops: any) => this.availableCrops = crops.length,
      error: (error: any) => console.error('Error loading crops:', error)
    });

    if (this.dealerDetails?.dealerId) {
      this.purchasesService.getMyPurchases(this.dealerDetails.dealerId).subscribe({
        next: (purchases: any) => this.totalPurchases = purchases.length,
        error: (error: any) => console.error('Error loading purchases:', error)
      });

      this.paymentService.getPaymentsByDealer(this.dealerDetails.dealerId).subscribe({
        next: (payments: any) => this.totalPayments = payments.length,
        error: (error: any) => console.error('Error loading payments:', error)
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getTotalPurchases(): number {
    return this.totalPurchases;
  }

  getTotalPayments(): number {
    return this.totalPayments;
  }

  getAvailableCrops(): number {
    return this.availableCrops;
  }
}
