import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DealerService } from '../../services/dealer.service';

@Component({
  selector: 'app-subscribed-farmers',
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule],
  template: `
    <div class="subscriptions-container">
      <div class="card-header">
        <h2><i class="material-icons">people</i> My Subscribed Farmers</h2>
      </div>
      <div class="card-body">
        <div class="loading-spinner" *ngIf="loading">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <div class="farmers-list" *ngIf="!loading && subscribedFarmers.length > 0">
          <div class="farmer-item" *ngFor="let subscription of subscribedFarmers">
            <div class="farmer-info">
              <div class="farmer-avatar">
                <i class="material-icons">person</i>
              </div>
              <div class="farmer-details">
                <h4>{{subscription.farmer?.farmerName}}</h4>
                <p class="location">{{subscription.farmer?.farmerLocation}}</p>
                <p class="subscribers">{{subscription.farmer?.subscriberCount}} subscribers</p>
              </div>
            </div>
            <div class="farmer-actions">
              <button class="btn btn-primary btn-sm" (click)="viewFarmerCrops(subscription.farmerId)">
                View Crops
              </button>
              <button class="btn btn-outline btn-sm" (click)="unsubscribe(subscription.farmerId)">
                Unsubscribe
              </button>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="!loading && subscribedFarmers.length === 0">
          <i class="material-icons">people_outline</i>
          <h3>No Subscriptions Yet</h3>
          <p>You haven't subscribed to any farmers yet. Browse farmers to start following their crops.</p>
          <button class="btn btn-primary" routerLink="/dealer/farmers">
            Browse Farmers
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .subscriptions-container {
      background: white;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-md);
      overflow: hidden;
    }

    .card-header {
      background: linear-gradient(135deg, var(--secondary-500), var(--secondary-600));
      color: white;
      padding: var(--spacing-lg);
    }

    .card-header h2 {
      margin: 0;
      font-size: var(--font-size-lg);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .card-body {
      padding: var(--spacing-lg);
    }

    .farmers-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .farmer-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      background: var(--gray-50);
      border-radius: var(--radius-md);
      border: 1px solid var(--gray-200);
      transition: all var(--transition-fast);
    }

    .farmer-item:hover {
      background: var(--secondary-50);
      border-color: var(--secondary-200);
    }

    .farmer-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .farmer-avatar {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, var(--secondary-500), var(--secondary-600));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .farmer-details h4 {
      margin: 0 0 var(--spacing-xs) 0;
      color: var(--gray-900);
      font-size: var(--font-size-base);
    }

    .farmer-details p {
      margin: 0;
      font-size: var(--font-size-sm);
      color: var(--gray-600);
    }

    .location {
      color: var(--secondary-600) !important;
      font-weight: 500;
    }

    .farmer-actions {
      display: flex;
      gap: var(--spacing-sm);
    }

    .empty-state {
      text-align: center;
      padding: var(--spacing-2xl);
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

    .empty-state p {
      margin-bottom: var(--spacing-xl);
    }

    @media (max-width: 768px) {
      .farmer-item {
        flex-direction: column;
        gap: var(--spacing-md);
        align-items: flex-start;
      }

      .farmer-actions {
        width: 100%;
        justify-content: space-between;
      }
    }
  `]
})
export class SubscribedFarmersComponent implements OnInit {
  subscribedFarmers: any[] = [];
  loading = true;

  constructor(private dealerService: DealerService) {}

  ngOnInit() {
    this.loadSubscribedFarmers();
  }

  private loadSubscribedFarmers() {
    this.loading = true;
    this.dealerService.getSubscribedFarmers().subscribe({
      next: (farmers) => {
        this.subscribedFarmers = farmers;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading subscribed farmers:', error);
        this.loading = false;
      }
    });
  }

  unsubscribe(farmerId: number) {
    this.dealerService.unsubscribeFromFarmer(farmerId).subscribe({
      next: () => {
        this.subscribedFarmers = this.subscribedFarmers.filter(s => s.farmerId !== farmerId);
      },
      error: (error) => console.error('Error unsubscribing:', error)
    });
  }

  viewFarmerCrops(farmerId: number) {
    // Implement navigation to farmer crops
  }
}