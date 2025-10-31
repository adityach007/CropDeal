import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header animate-fade-in">
        <div class="header-content">
          <div class="welcome-section">
            <div class="avatar">
              <i class="material-icons">admin_panel_settings</i>
            </div>
            <div class="welcome-text">
              <h1>Admin Dashboard</h1>
              <p class="subtitle">Manage platform users, payments, and purchases</p>
            </div>
          </div>
          <div class="header-actions">
            <button class="btn btn-outline" (click)="logout()">
              <i class="material-icons">logout</i>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div class="stats-grid" *ngIf="!loading">
        <div class="stat-card animate-fade-in">
          <div class="stat-icon">
            <i class="material-icons">person</i>
          </div>
          <div class="stat-content">
            <h3>{{stats.totalFarmers || 0}}</h3>
            <p>Total Farmers</p>
            <span class="stat-badge">{{stats.activeFarmers || 0}} Active</span>
          </div>
        </div>
        <div class="stat-card animate-fade-in">
          <div class="stat-icon">
            <i class="material-icons">business</i>
          </div>
          <div class="stat-content">
            <h3>{{stats.totalDealers || 0}}</h3>
            <p>Total Dealers</p>
            <span class="stat-badge">{{stats.activeDealers || 0}} Active</span>
          </div>
        </div>
        <div class="stat-card animate-fade-in">
          <div class="stat-icon">
            <i class="material-icons">agriculture</i>
          </div>
          <div class="stat-content">
            <h3>{{stats.totalCrops || 0}}</h3>
            <p>Total Crops</p>
          </div>
        </div>
        <div class="stat-card animate-fade-in">
          <div class="stat-icon">
            <i class="material-icons">shopping_cart</i>
          </div>
          <div class="stat-content">
            <h3>{{stats.totalPurchases || 0}}</h3>
            <p>Total Purchases</p>
          </div>
        </div>
        <div class="stat-card animate-fade-in">
          <div class="stat-icon">
            <i class="material-icons">payment</i>
          </div>
          <div class="stat-content">
            <h3>{{stats.totalPayments || 0}}</h3>
            <p>Total Payments</p>
          </div>
        </div>
        <div class="stat-card animate-fade-in">
          <div class="stat-icon">
            <i class="material-icons">currency_rupee</i>
          </div>
          <div class="stat-content">
            <h3>₹{{stats.totalRevenue || 0}}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      <div class="tabs-container">
        <div class="tabs">
          <button 
            class="tab" 
            [class.active]="activeTab === 'farmers'"
            (click)="switchTab('farmers')">
            <i class="material-icons">person</i>
            Farmers
          </button>
          <button 
            class="tab" 
            [class.active]="activeTab === 'dealers'"
            (click)="switchTab('dealers')">
            <i class="material-icons">business</i>
            Dealers
          </button>
          <button 
            class="tab" 
            [class.active]="activeTab === 'purchases'"
            (click)="switchTab('purchases')">
            <i class="material-icons">shopping_cart</i>
            Purchases
          </button>
          <button 
            class="tab" 
            [class.active]="activeTab === 'analytics'"
            (click)="switchTab('analytics')">
            <i class="material-icons">analytics</i>
            Analytics
          </button>
        </div>
      </div>

      <div class="tab-content">
        <div *ngIf="activeTab === 'farmers'" class="card animate-fade-in">
          <div class="card-header">
            <h2><i class="material-icons">person</i> All Farmers</h2>
            <span class="count-badge">{{farmers.length}}</span>
          </div>
          <div class="card-body">
            <div class="table-container" *ngIf="farmers.length > 0; else noFarmers">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Verified</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let farmer of farmers">
                    <td>{{farmer.farmerId}}</td>
                    <td>{{farmer.farmerName}}</td>
                    <td>{{farmer.emailAddressFarmer}}</td>
                    <td>{{farmer.farmerPhoneNumber}}</td>
                    <td>{{farmer.farmerLocation}}</td>
                    <td>
                      <span class="status-badge" [class.active]="farmer.isFarmerIdActive">
                        {{farmer.isFarmerIdActive ? 'Active' : 'Inactive'}}
                      </span>
                    </td>
                    <td>
                      <span class="status-badge" [class.active]="farmer.isVerified">
                        {{farmer.isVerified ? 'Verified' : 'Unverified'}}
                      </span>
                    </td>
                    <td>
                      <button 
                        class="btn-toggle"
                        [class.active]="farmer.isFarmerIdActive"
                        (click)="toggleFarmerStatus(farmer.farmerId)">
                        {{farmer.isFarmerIdActive ? 'Deactivate' : 'Activate'}}
                      </button>
                      <button 
                        class="btn-toggle btn-verify"
                        [class.active]="farmer.isVerified"
                        (click)="toggleFarmerVerification(farmer.farmerId)">
                        {{farmer.isVerified ? 'Unverify' : 'Verify'}}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <ng-template #noFarmers>
              <div class="empty-state">
                <i class="material-icons">person</i>
                <h3>No farmers found</h3>
              </div>
            </ng-template>
          </div>
        </div>

        <div *ngIf="activeTab === 'dealers'" class="card animate-fade-in">
          <div class="card-header">
            <h2><i class="material-icons">business</i> All Dealers</h2>
            <span class="count-badge">{{dealers.length}}</span>
          </div>
          <div class="card-body">
            <div class="table-container" *ngIf="dealers.length > 0; else noDealers">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let dealer of dealers">
                    <td>{{dealer.dealerId}}</td>
                    <td>{{dealer.dealerName}}</td>
                    <td>{{dealer.dealerEmailAddress}}</td>
                    <td>{{dealer.dealerPhoneNumber}}</td>
                    <td>{{dealer.dealerLocation}}</td>
                    <td>
                      <span class="status-badge" [class.active]="dealer.isDealerIdActive">
                        {{dealer.isDealerIdActive ? 'Active' : 'Inactive'}}
                      </span>
                    </td>
                    <td>
                      <button 
                        class="btn-toggle"
                        [class.active]="dealer.isDealerIdActive"
                        (click)="toggleDealerStatus(dealer.dealerId)">
                        {{dealer.isDealerIdActive ? 'Deactivate' : 'Activate'}}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <ng-template #noDealers>
              <div class="empty-state">
                <i class="material-icons">business</i>
                <h3>No dealers found</h3>
              </div>
            </ng-template>
          </div>
        </div>

        <div *ngIf="activeTab === 'purchases'" class="card animate-fade-in">
          <div class="card-header">
            <h2><i class="material-icons">shopping_cart</i> All Purchases</h2>
            <span class="count-badge">{{purchases.length}}</span>
          </div>
          <div class="card-body">
            <div class="table-container" *ngIf="purchases.length > 0; else noPurchases">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Crop</th>
                    <th>Quantity</th>
                    <th>Farmer</th>
                    <th>Dealer</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let purchase of purchases">
                    <td>{{purchase.purchaseId}}</td>
                    <td>{{purchase.crop?.cropName || 'N/A'}}</td>
                    <td>{{purchase.quantityRequested}} kg</td>
                    <td>{{purchase.farmerName || 'N/A'}}</td>
                    <td>{{purchase.dealer?.dealerName || 'N/A'}}</td>
                    <td>
                      <span class="status-badge" [class.active]="purchase.isConfirmed">
                        {{purchase.isConfirmed ? 'Confirmed' : 'Pending'}}
                      </span>
                    </td>
                    <td>{{purchase.requestedAt | date:'short'}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <ng-template #noPurchases>
              <div class="empty-state">
                <i class="material-icons">shopping_cart</i>
                <h3>No purchases found</h3>
              </div>
            </ng-template>
          </div>
        </div>

        <div *ngIf="activeTab === 'analytics'" class="analytics-container animate-fade-in">
          <div *ngIf="analytics; else loadingAnalytics">
            <div class="analytics-grid">
              <div class="card full-width">
                <div class="card-header">
                  <h2><i class="material-icons">bar_chart</i> Sales by Crop Type</h2>
                </div>
                <div class="card-body">
                  <div *ngIf="analytics.salesByType && analytics.salesByType.length > 0; else noSalesData">
                    <div class="revenue-grid">
                      <div *ngFor="let item of analytics.salesByType" class="revenue-card">
                        <div class="revenue-icon">
                          <i class="material-icons">{{item.cropType === 'Vegetable' ? 'eco' : 'apple'}}</i>
                        </div>
                        <div class="revenue-details">
                          <div class="revenue-type">{{item.cropType}}</div>
                          <div class="revenue-amount">{{item.totalSales | number}} kg</div>
                          <div class="revenue-count">{{item.totalOrders}} orders • Avg: {{item.averageOrderSize | number:'1.0-0'}} kg</div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="revenue-chart">
                      <div class="chart-title">Sales Volume Distribution</div>
                      <div class="chart-bars-horizontal">
                        <div *ngFor="let item of analytics.salesByType" class="chart-bar-item">
                          <div class="bar-label-left">{{item.cropType}}</div>
                          <div class="bar-container">
                            <div class="bar-fill" 
                                 [style.width.%]="getSalesPercentage(item.totalSales)"
                                 [class.vegetable]="item.cropType === 'Vegetable'"
                                 [class.fruit]="item.cropType === 'Fruit'">
                              <span class="bar-text">{{item.totalSales | number}} kg</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <ng-template #noSalesData>
                    <div class="empty-state">
                      <i class="material-icons">shopping_cart_off</i>
                      <h3>No sales data available</h3>
                      <p>Complete some purchases to see sales analytics</p>
                    </div>
                  </ng-template>
                </div>
              </div>

            <div class="card full-width">
              <div class="card-header">
                <h2><i class="material-icons">trending_up</i> Top Selling Crops</h2>
              </div>
              <div class="card-body">
                <div class="table-container" *ngIf="analytics?.topCrops?.length > 0; else noData">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Crop Name</th>
                        <th>Type</th>
                        <th>Total Quantity</th>
                        <th>Orders</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let crop of analytics.topCrops; let i = index">
                        <td><span class="rank-badge">{{i + 1}}</span></td>
                        <td>{{crop.cropName}}</td>
                        <td><span class="type-badge">{{crop.cropType}}</span></td>
                        <td>{{crop.totalQuantity}} kg</td>
                        <td>{{crop.orderCount}}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div class="card full-width">
              <div class="card-header">
                <h2><i class="material-icons">leaderboard</i> Top Performing Farmers</h2>
              </div>
              <div class="card-body">
                <div class="table-container" *ngIf="analytics?.farmerPerformance?.length > 0; else noData">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Farmer Name</th>
                        <th>Status</th>
                        <th>Total Sales</th>
                        <th>Orders</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let farmer of analytics.farmerPerformance; let i = index">
                        <td><span class="rank-badge">{{i + 1}}</span></td>
                        <td>{{farmer.farmerName}}</td>
                        <td>
                          <span class="status-badge" [class.active]="farmer.isVerified">
                            {{farmer.isVerified ? 'Verified' : 'Unverified'}}
                          </span>
                        </td>
                        <td>{{farmer.totalSales}} kg</td>
                        <td>{{farmer.orderCount}}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

            </div>

            <ng-template #noData>
              <div class="empty-state">
                <i class="material-icons">analytics</i>
                <h3>No data available</h3>
              </div>
            </ng-template>
          </div>

          <ng-template #loadingAnalytics>
            <div class="empty-state">
              <i class="material-icons">hourglass_empty</i>
              <h3>Loading analytics...</h3>
            </div>
          </ng-template>
        </div>
      </div>
    
  `,
  styles: [`
    .dashboard-container {
      padding: var(--spacing-lg);
      max-width: 1400px;
      margin: 0 auto;
      min-height: 100vh;
    }

    .dashboard-header {
      margin-bottom: var(--spacing-2xl);
      background: white;
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-2xl);
      background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%);
    }

    .welcome-section {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
    }

    .avatar {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-md);
    }

    .avatar i {
      color: white;
      font-size: 2.5rem;
    }

    .welcome-text h1 {
      color: white;
      margin-bottom: var(--spacing-sm);
      font-size: var(--font-size-3xl);
    }

    .subtitle {
      color: rgba(255, 255, 255, 0.9);
      font-size: var(--font-size-lg);
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: var(--spacing-md);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-2xl);
    }

    .stat-card {
      background: white;
      padding: var(--spacing-xl);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-md);
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      transition: all var(--transition-normal);
      border: 1px solid var(--gray-200);
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
      border-color: #9333ea;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #f3e8ff, #e9d5ff);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon i {
      color: #7e22ce;
      font-size: 1.8rem;
    }

    .stat-content h3 {
      font-size: var(--font-size-2xl);
      font-weight: 700;
      color: var(--gray-900);
      margin: 0 0 var(--spacing-xs) 0;
    }

    .stat-content p {
      color: var(--gray-600);
      font-size: var(--font-size-sm);
      margin: 0;
    }

    .stat-badge {
      display: inline-block;
      background: #f3e8ff;
      color: #7e22ce;
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: var(--font-size-xs);
      font-weight: 600;
      margin-top: 0.25rem;
    }

    .tabs-container {
      background: white;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-md);
      margin-bottom: var(--spacing-xl);
      overflow: hidden;
    }

    .tabs {
      display: flex;
      gap: 0;
      overflow-x: auto;
    }

    .tab {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-lg);
      border: none;
      background: white;
      color: var(--gray-600);
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
      border-bottom: 3px solid transparent;
    }

    .tab:hover {
      background: var(--gray-50);
      color: #7e22ce;
    }

    .tab.active {
      color: #7e22ce;
      border-bottom-color: #7e22ce;
      background: #faf5ff;
    }

    .tab i {
      font-size: 1.2rem;
    }

    .tab-content {
      animation: fadeIn 0.3s ease;
    }

    .table-container {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table thead {
      background: var(--gray-50);
    }

    .data-table th {
      padding: var(--spacing-md);
      text-align: left;
      font-weight: 600;
      color: var(--gray-700);
      font-size: var(--font-size-sm);
      border-bottom: 2px solid var(--gray-200);
    }

    .data-table td {
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--gray-200);
      color: var(--gray-800);
      font-size: var(--font-size-sm);
    }

    .data-table tr:hover {
      background: var(--gray-50);
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: var(--radius-sm);
      font-size: var(--font-size-xs);
      font-weight: 600;
      background: var(--gray-200);
      color: var(--gray-700);
    }

    .status-badge.active {
      background: #d1fae5;
      color: #065f46;
    }

    .btn-toggle {
      padding: 0.375rem 0.75rem;
      border: none;
      border-radius: var(--radius-md);
      font-size: var(--font-size-xs);
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
      background: #fee2e2;
      color: #991b1b;
    }

    .btn-toggle.active {
      background: #d1fae5;
      color: #065f46;
    }

    .btn-toggle:hover {
      opacity: 0.8;
      transform: scale(1.05);
    }

    .btn-verify {
      margin-left: 0.5rem;
      background: #fef3c7;
      color: #92400e;
    }

    .btn-verify.active {
      background: #dbeafe;
      color: #1e40af;
    }

    .count-badge {
      background: rgba(255,255,255,0.2);
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .empty-state {
      text-align: center;
      padding: var(--spacing-3xl);
      color: var(--gray-600);
    }

    .empty-state i {
      font-size: 4rem;
      color: var(--gray-400);
      margin-bottom: var(--spacing-lg);
    }

    .empty-state h3 {
      color: var(--gray-700);
      margin-bottom: var(--spacing-md);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .analytics-container {
      width: 100%;
    }

    .analytics-grid {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xl);
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .chart-bars {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .bar-item {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .bar-label {
      font-weight: 600;
      color: var(--gray-700);
      font-size: var(--font-size-sm);
    }

    .bar-wrapper {
      background: var(--gray-100);
      border-radius: var(--radius-md);
      height: 40px;
      overflow: hidden;
    }

    .bar {
      height: 100%;
      background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%);
      display: flex;
      align-items: center;
      padding: 0 var(--spacing-md);
      transition: width 0.5s ease;
      min-width: 80px;
    }

    .bar-value {
      color: white;
      font-weight: 600;
      font-size: var(--font-size-sm);
    }

    .bar-info {
      font-size: var(--font-size-xs);
      color: var(--gray-600);
    }

    .revenue-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--spacing-xl);
      margin-bottom: var(--spacing-2xl);
    }

    .revenue-card {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-xl);
      background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
      border-radius: var(--radius-xl);
      transition: all var(--transition-fast);
      box-shadow: var(--shadow-md);
    }

    .revenue-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .revenue-icon {
      width: 70px;
      height: 70px;
      background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
    }

    .revenue-icon i {
      color: white;
      font-size: 2rem;
    }

    .revenue-details {
      flex: 1;
    }

    .revenue-type {
      font-weight: 600;
      color: var(--gray-700);
      margin-bottom: 0.25rem;
    }

    .revenue-amount {
      font-size: 1.75rem;
      font-weight: 700;
      color: #7e22ce;
      margin-bottom: 0.25rem;
    }

    .revenue-count {
      font-size: var(--font-size-xs);
      color: var(--gray-600);
    }

    .revenue-chart {
      margin-top: var(--spacing-2xl);
      padding: var(--spacing-xl);
      background: var(--gray-50);
      border-radius: var(--radius-lg);
    }

    .chart-title {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--gray-800);
      margin-bottom: var(--spacing-xl);
      text-align: center;
    }

    .chart-bars-horizontal {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .chart-bar-item {
      display: grid;
      grid-template-columns: 120px 1fr;
      align-items: center;
      gap: var(--spacing-md);
    }

    .bar-label-left {
      font-weight: 600;
      color: var(--gray-700);
      font-size: var(--font-size-sm);
      text-align: right;
    }

    .bar-container {
      background: white;
      border-radius: var(--radius-md);
      height: 50px;
      position: relative;
      overflow: hidden;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
    }

    .bar-fill {
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0 var(--spacing-md);
      transition: width 0.8s ease;
      position: relative;
      min-width: 100px;
    }

    .bar-fill.vegetable {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .bar-fill.fruit {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }

    .bar-text {
      color: white;
      font-weight: 700;
      font-size: var(--font-size-sm);
      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }

    .rank-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%);
      color: white;
      border-radius: 50%;
      font-weight: 700;
      font-size: var(--font-size-xs);
    }

    .type-badge {
      padding: 0.25rem 0.75rem;
      border-radius: var(--radius-sm);
      font-size: var(--font-size-xs);
      font-weight: 600;
      background: #e0e7ff;
      color: #3730a3;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: var(--spacing-md);
      }

      .header-content {
        flex-direction: column;
        gap: var(--spacing-lg);
        text-align: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .tabs {
        flex-wrap: nowrap;
      }

      .tab {
        font-size: var(--font-size-sm);
        padding: var(--spacing-md);
      }

      .revenue-grid {
        grid-template-columns: 1fr;
      }

      .chart-bar-item {
        grid-template-columns: 80px 1fr;
      }

      .bar-label-left {
        font-size: var(--font-size-xs);
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: any = {};
  farmers: any[] = [];
  dealers: any[] = [];
  purchases: any[] = [];
  analytics: any = null;
  activeTab: string = 'farmers';
  loading: boolean = true;

  private apiUrl = 'http://localhost:5209/api';

  constructor(
    private http: HttpClient, 
    private router: Router,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  private getHeaders() {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  loadDashboardData() {
    this.loading = true;
    this.http.get(`${this.apiUrl}/Admin/dashboard/stats`, { headers: this.getHeaders() })
      .subscribe({
        next: (data: any) => {
          this.stats = {
            totalFarmers: data.totalFarmers,
            activeFarmers: data.activeFarmers,
            totalDealers: data.totalDealers,
            activeDealers: data.activeDealers,
            totalCrops: data.totalCrops,
            totalPurchases: data.totalPurchases,
            totalPayments: data.totalPayments,
            totalRevenue: data.totalRevenue
          };
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Error loading stats', err);
          this.loading = false;
        }
      });
  }

  loadFarmers() {
    this.http.get<any[]>(`${this.apiUrl}/Farmer/all-farmers-admin`, { headers: this.getHeaders() })
      .subscribe({
        next: (data: any) => this.farmers = data,
        error: (err: any) => console.error('Error loading farmers', err)
      });
  }

  loadDealers() {
    this.http.get<any[]>(`${this.apiUrl}/Dealer/all-dealers-admin`, { headers: this.getHeaders() })
      .subscribe({
        next: (data: any) => this.dealers = data,
        error: (err: any) => console.error('Error loading dealers', err)
      });
  }

  loadPurchases() {
    this.http.get<any[]>(`${this.apiUrl}/Admin/all-purchases`, { headers: this.getHeaders() })
      .subscribe({
        next: (data: any) => {
          this.purchases = data;
          this.http.get<any[]>(`${this.apiUrl}/Farmer/all-farmers-admin`, { headers: this.getHeaders() })
            .subscribe({
              next: (farmers: any) => {
                this.purchases.forEach(purchase => {
                  if (purchase.crop?.farmerId) {
                    const farmer = farmers.find((f: any) => f.farmerId === purchase.crop.farmerId);
                    if (farmer) {
                      purchase.farmerName = farmer.farmerName;
                    }
                  }
                });
              }
            });
        },
        error: (err: any) => console.error('Error loading purchases', err)
      });
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'farmers' && this.farmers.length === 0) this.loadFarmers();
    if (tab === 'dealers' && this.dealers.length === 0) this.loadDealers();
    if (tab === 'purchases' && this.purchases.length === 0) this.loadPurchases();
    if (tab === 'analytics' && !this.analytics) this.loadAnalytics();
  }

  loadAnalytics() {
    this.http.get(`${this.apiUrl}/Admin/crop-analytics`, { headers: this.getHeaders() })
      .subscribe({
        next: (data: any) => {
          this.analytics = data;
          console.log('Analytics data:', data);
        },
        error: (err: any) => console.error('Error loading analytics', err)
      });
  }

  getMaxSales(): number {
    if (!this.analytics?.salesByType?.length) return 1;
    return Math.max(...this.analytics.salesByType.map((s: any) => s.totalSales));
  }

  getSalesPercentage(sales: number): number {
    const max = this.getMaxSales();
    return max > 0 ? (sales / max) * 100 : 0;
  }

  toggleFarmerStatus(farmerId: number) {
    this.http.put(`${this.apiUrl}/Admin/farmer/${farmerId}/toggle-status`, {}, { headers: this.getHeaders() })
      .subscribe({
        next: (response: any) => {
          this.toast.success(response.message || 'Farmer status updated successfully!');
          this.loadFarmers();
          this.loadDashboardData();
        },
        error: (err: any) => this.toast.error('Failed to update farmer status')
      });
  }

  toggleFarmerVerification(farmerId: number) {
    this.http.put(`${this.apiUrl}/Farmer/verify-farmer-admin/${farmerId}`, {}, { headers: this.getHeaders() })
      .subscribe({
        next: (response: any) => {
          this.toast.success('Farmer verification updated successfully!');
          this.loadFarmers();
        },
        error: (err: any) => this.toast.error('Failed to update verification')
      });
  }

  toggleDealerStatus(dealerId: number) {
    this.http.put(`${this.apiUrl}/Admin/dealer/${dealerId}/toggle-status`, {}, { headers: this.getHeaders() })
      .subscribe({
        next: (response: any) => {
          this.toast.success(response.message || 'Dealer status updated successfully!');
          this.loadDealers();
          this.loadDashboardData();
        },
        error: (err: any) => this.toast.error('Failed to update dealer status')
      });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
