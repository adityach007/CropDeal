import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { CropsService, Crop } from '../../services/crops.service';
import { PurchaseRequestService, PurchaseRequest } from '../../services/purchase-request.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-available-crops',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card-header">
      <h2><span class="header-icon">🌿</span> Available Crops</h2>
      <span class="count-badge" *ngIf="crops.length > 0">{{ crops.length }}</span>
    </div>
    <div class="card-body">
      <div *ngIf="crops.length === 0" class="empty-state">
        <div class="empty-icon">🌾</div>
        <h3>No Crops Available</h3>
        <p>Check back later for new crop listings from farmers</p>
      </div>
      <div class="crops-list" *ngIf="crops.length > 0">
        <div *ngFor="let crop of crops; trackBy: trackByCropId" class="crop-item">
          <div class="crop-summary">
            <div class="crop-info">
              <div class="crop-title">
                <span class="crop-icon">{{ getCropTypeIcon(crop.cropType) }}</span>
                <span class="crop-name">{{ crop.cropName }}</span>
                <span class="type-badge" [class]="'type-' + crop.cropType.toLowerCase()">
                  {{ crop.cropType }}
                </span>
              </div>
              <div class="crop-meta">
                <span class="meta-item">
                  <span class="meta-icon">⚖️</span>
                  {{ crop.quantityInKg }} kg available
                </span>
                <span class="meta-item price">
                  <span class="meta-icon">💰</span>
                  ₹{{ crop.pricePerUnit }}/kg
                </span>
                <span class="meta-item">
                  <span class="meta-icon">📍</span>
                  {{ crop.location }}
                </span>
              </div>
            </div>
            <div class="purchase-section">
              <div class="quantity-controls">
                <input 
                  type="number" 
                  [(ngModel)]="crop.requestQuantity" 
                  placeholder="Qty"
                  min="1"
                  [max]="crop.quantityInKg"
                  class="quantity-input">
                <span class="unit-label">kg</span>
              </div>
              <button 
                (click)="requestPurchase(crop)" 
                [disabled]="!crop.requestQuantity || crop.requestQuantity <= 0"
                class="btn-request">
                <span class="btn-icon">🛒</span>
                Request
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
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
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

    .crops-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .crop-item {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 12px;
      transition: all 0.2s ease;
    }

    .crop-item:hover {
      border-color: #4CAF50;
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.1);
    }

    .crop-summary {
      padding: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
    }

    .crop-info {
      flex: 1;
    }

    .crop-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
    }

    .crop-icon {
      font-size: 1.5rem;
    }

    .crop-name {
      font-weight: 700;
      color: #333;
      font-size: 1.1rem;
    }

    .type-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .type-vegetable {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .type-fruit {
      background: #fff3e0;
      color: #f57c00;
    }

    .type-grain {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .crop-meta {
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

    .meta-item.price {
      font-weight: 600;
      color: #4CAF50;
      font-size: 1rem;
    }

    .meta-icon {
      font-size: 1rem;
    }

    .purchase-section {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
      min-width: 200px;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      background: white;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      overflow: hidden;
      flex: 1;
    }

    .quantity-input {
      width: 60px;
      padding: 0.5rem 0.5rem;
      border: none;
      outline: none;
      font-size: 0.875rem;
      text-align: center;
    }

    .unit-label {
      padding: 0.5rem 0.5rem;
      background: #f8f9fa;
      color: #666;
      font-size: 0.875rem;
      font-weight: 500;
      border-left: 1px solid #e9ecef;
    }

    .btn-request {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .btn-request:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }

    .btn-request:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .btn-icon {
      font-size: 1rem;
    }

    @media (max-width: 768px) {
      .crop-summary {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .crop-meta {
        flex-direction: column;
        gap: 0.5rem;
      }

      .purchase-section {
        justify-content: space-between;
      }

      .btn-request {
        flex: 1;
        justify-content: center;
      }
    }
  `]
})
export class AvailableCropsComponent implements OnInit {
  crops: (Crop & { requestQuantity?: number })[] = [];

  constructor(
    private cropsService: CropsService,
    private purchaseRequestService: PurchaseRequestService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.auth$.pipe(
      filter(user => user !== null)
    ).subscribe((user) => {
      // Only load crops if user is a dealer (userType = 2)
      if (user && user.userType === 2) {
        this.loadCrops();
      }
    });
  }

  loadCrops() {
    this.cropsService.getAllCrops().subscribe({
      next: (crops) => {
        this.crops = crops.map(crop => ({ ...crop, requestQuantity: 1 }));
      },
      error: (error) => {
        console.error('Error loading crops:', error);
      }
    });
  }

  requestPurchase(crop: Crop & { requestQuantity?: number }) {
    if (!crop.requestQuantity || crop.requestQuantity <= 0) return;

    const request: PurchaseRequest = {
      cropId: crop.cropId,
      quantityRequested: crop.requestQuantity
    };

    this.purchaseRequestService.createPurchaseRequest(request).subscribe({
      next: (response) => {
        alert('Purchase request sent successfully!');
        crop.requestQuantity = 1;
      },
      error: (error) => {
        console.error('Error creating purchase request:', error);
        alert('Failed to send purchase request');
      }
    });
  }

  getCropTypeIcon(cropType: string): string {
    switch (cropType.toLowerCase()) {
      case 'vegetable': return '🥬';
      case 'fruit': return '🍎';
      case 'grain': return '🌾';
      default: return '🌱';
    }
  }

  trackByCropId(index: number, crop: Crop): number {
    return crop.cropId;
  }
}