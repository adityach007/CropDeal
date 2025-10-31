import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { FarmerPurchaseService } from '../../services/farmer-purchase.service';
import { AuthService } from '../../services/auth.service';
import { Purchase } from '../../services/purchases.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-manage-purchase-requests',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-header">
      <h2><span class="header-icon">📋</span> Purchase Requests</h2>
      <span class="count-badge" *ngIf="purchaseRequests.length > 0">{{ purchaseRequests.length }}</span>
    </div>
    <div class="card-body">
      <div *ngIf="purchaseRequests.length === 0" class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>No Purchase Requests</h3>
        <p>Purchase requests from dealers will appear here</p>
      </div>
      <div class="requests-list" *ngIf="purchaseRequests.length > 0">
        <div *ngFor="let request of purchaseRequests; trackBy: trackByRequestId" class="request-item">
          <div class="request-summary">
            <div class="request-info">
              <div class="request-title">
                <span class="request-icon">🛒</span>
                <span class="request-id">Request #{{ request.purchaseId }}</span>
                <span class="status-badge" [class]="request.isConfirmed ? 'confirmed' : 'pending'">
                  {{ request.isConfirmed ? '✅ Confirmed' : '⏳ Pending' }}
                </span>
              </div>
              <div class="request-meta">
                <span class="meta-item">
                  <span class="meta-icon">📦</span>
                  {{ request.quantityRequested }} kg
                </span>
                <span class="meta-item">
                  <span class="meta-icon">📅</span>
                  {{ request.requestedAt | date:'MMM d' }}
                </span>
              </div>
            </div>
            <div class="request-actions" *ngIf="!request.isConfirmed">
              <button class="btn-confirm" (click)="confirmPurchase(request)">
                <span class="btn-icon">✓</span>
                Confirm
              </button>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

    .requests-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .request-item {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .request-item:hover {
      border-color: #667eea;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
    }

    .request-summary {
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .request-info {
      flex: 1;
    }

    .request-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .request-icon {
      font-size: 1rem;
    }

    .request-id {
      font-weight: 600;
      color: #333;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .status-badge.pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.confirmed {
      background: #d1edff;
      color: #0c5460;
    }

    .request-meta {
      display: flex;
      gap: 1rem;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.875rem;
      color: #666;
    }

    .meta-icon {
      font-size: 0.875rem;
    }

    .request-actions {
      flex-shrink: 0;
    }

    .btn-confirm {
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
    }

    .btn-confirm:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }

    .btn-icon {
      font-size: 1rem;
    }

    @media (max-width: 768px) {
      .request-summary {
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
      }

      .request-actions {
        align-self: stretch;
      }

      .btn-confirm {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ManagePurchaseRequestsComponent implements OnInit {
  purchaseRequests: Purchase[] = [];

  constructor(
    private farmerPurchaseService: FarmerPurchaseService,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.authService.auth$.pipe(
      filter(user => user !== null)
    ).subscribe(currentUser => {
      const FARMER_TYPE = 1;
      if (currentUser && currentUser.userType === FARMER_TYPE) {
        this.loadPurchaseRequests(currentUser.userId);
      }
    });
  }

  private loadPurchaseRequests(farmerId: number) {
    this.farmerPurchaseService.getMyPurchaseRequests(farmerId).subscribe({
      next: (requests) => {
        this.purchaseRequests = requests;
      },
      error: (error) => {
        console.error('Error loading purchase requests:', error);
      }
    });
  }

  confirmPurchase(request: Purchase) {
    this.farmerPurchaseService.confirmPurchase(request.purchaseId).subscribe({
      next: (response) => {
        this.toast.success('Purchase confirmed successfully!');
        request.isConfirmed = true;
      },
      error: (error) => {
        console.error('Error confirming purchase:', error);
        this.toast.error('Failed to confirm purchase');
      }
    });
  }

  trackByRequestId(index: number, request: Purchase): number {
    return request.purchaseId;
  }
}