import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FarmerService } from '../../services/farmer.service';
import { DealerService } from '../../services/dealer.service';
import { Farmer } from '../../models/interfaces';

@Component({
  selector: 'app-browse-farmers',
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule],
  template: `
    <div class="browse-container">
      <header class="page-header">
        <h1>Browse Farmers</h1>
        <button class="back-btn" routerLink="/dealer/dashboard">Back to Dashboard</button>
      </header>

      <div class="loading-spinner" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div class="farmers-grid" *ngIf="!loading">
        <div class="farmer-card" *ngFor="let farmer of farmers">
          <div class="farmer-header">
            <h3>{{farmer.farmerName}}</h3>
            <span class="farmer-location">{{farmer.farmerLocation}}</span>
          </div>
          <div class="farmer-details">
            <p><strong>Subscribers:</strong> {{farmer.subscriberCount}}</p>
          </div>
          <div class="action-buttons">
            <button 
              class="subscribe-btn" 
              [class.subscribed]="isSubscribed(farmer.farmerId)"
              (click)="toggleSubscription(farmer.farmerId)"
              [disabled]="loading">
              {{isSubscribed(farmer.farmerId) ? 'Unsubscribe' : 'Subscribe'}}
            </button>
          </div>
        </div>
      </div>

      <div class="no-farmers" *ngIf="!loading && farmers.length === 0">
        <p>No farmers available at the moment.</p>
      </div>
    </div>
  `,
  styles: [`
    .browse-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
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

    .back-btn {
      padding: 8px 16px;
      background-color: #757575;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .back-btn:hover {
      background-color: #616161;
    }

    .farmers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    .farmer-card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .farmer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .farmer-header h3 {
      margin: 0;
      color: #2e7d32;
    }

    .farmer-location {
      background: #e8f5e9;
      color: #2e7d32;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .farmer-details p {
      margin: 8px 0;
      color: #555;
    }

    .action-buttons {
      display: flex;
      gap: 10px;
      margin-top: 15px;
    }

    .subscribe-btn {
      flex: 1;
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
      color: white;
      background-color: #4caf50;
    }

    .subscribe-btn:hover {
      background-color: #45a049;
    }

    .subscribe-btn.subscribed {
      background-color: #f44336;
    }

    .subscribe-btn.subscribed:hover {
      background-color: #d32f2f;
    }

    .subscribe-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .no-farmers {
      text-align: center;
      color: #666;
      font-style: italic;
      padding: 40px;
    }

    @media (max-width: 768px) {
      .farmers-grid {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class BrowseFarmersComponent implements OnInit {
  farmers: Farmer[] = [];
  loading = true;
  subscriptionStatus: {[farmerId: number]: boolean} = {};

  constructor(
    private farmerService: FarmerService,
    private dealerService: DealerService
  ) {}

  ngOnInit() {
    this.loadFarmers();
  }

  private loadFarmers() {
    this.loading = true;
    this.farmerService.getAllFarmers().subscribe({
      next: (farmers: Farmer[]) => {
        this.farmers = farmers;
        this.loadSubscriptionStatuses();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading farmers:', error);
        this.loading = false;
      }
    });
  }

  private loadSubscriptionStatuses() {
    this.farmers.forEach(farmer => {
      this.dealerService.checkSubscriptionStatus(farmer.farmerId).subscribe({
        next: (response) => {
          this.subscriptionStatus[farmer.farmerId] = response.isSubscribed;
        },
        error: (error) => console.error('Error checking subscription:', error)
      });
    });
  }

  isSubscribed(farmerId: number): boolean {
    return this.subscriptionStatus[farmerId] || false;
  }

  toggleSubscription(farmerId: number) {
    const isCurrentlySubscribed = this.isSubscribed(farmerId);
    const action = isCurrentlySubscribed ? 
      this.dealerService.unsubscribeFromFarmer(farmerId) : 
      this.dealerService.subscribeToFarmer(farmerId);

    action.subscribe({
      next: () => {
        this.subscriptionStatus[farmerId] = !isCurrentlySubscribed;
      },
      error: (error) => console.error('Subscription error:', error)
    });
  }
}
