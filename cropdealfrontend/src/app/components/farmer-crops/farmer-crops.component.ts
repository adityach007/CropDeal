import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CropsService } from '../../services/crops.service';
import { CropPurchaseService } from '../../services/crop-purchase.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-farmer-crops',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="farmer-crops-container">
      <h2>Crops by {{farmerName}}</h2>
      <div *ngIf="loading" class="loading-spinner">
        Loading crops...
      </div>
      <div *ngIf="!loading && crops.length === 0" class="no-crops">
        No crops available for this farmer.
      </div>
      <div *ngIf="!loading && crops.length > 0">
        <div class="crop-card" *ngFor="let crop of crops">
          <h3>{{crop.cropName}}</h3>
          <p><strong>Type:</strong> {{crop.cropType}}</p>
          <p><strong>Quantity Available:</strong> {{crop.quantityInKg}} kg</p>
          <p><strong>Price per Unit:</strong> ₹{{crop.pricePerUnit}}</p>
          <p><strong>Location:</strong> {{crop.location}}</p>
          <div class="purchase-section">
            <input type="number" [(ngModel)]="crop.requestedQuantity" min="1" [max]="crop.quantityInKg" placeholder="Enter quantity">
            <button (click)="requestPurchase(crop)">Request Purchase</button>
          </div>
          <div *ngIf="crop.purchaseMessage" class="purchase-message">{{crop.purchaseMessage}}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .farmer-crops-container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .crop-card { background: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.08); padding: 20px; margin-bottom: 20px; }
    .purchase-section { margin-top: 10px; display: flex; gap: 10px; }
    .purchase-message { margin-top: 8px; color: #2e7d32; font-weight: 500; }
    .loading-spinner, .no-crops { text-align: center; color: #666; font-style: italic; padding: 40px; }
  `]
})
export class FarmerCropsComponent implements OnInit {
  crops: any[] = [];
  farmerId: number;
  farmerName: string = '';
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private cropsService: CropsService,
    private cropPurchaseService: CropPurchaseService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.farmerId = Number(this.route.snapshot.paramMap.get('farmerId'));
    this.loadCrops();
  }

  loadCrops() {
    this.loading = true;
    this.cropsService.getCropsByFarmer(this.farmerId).subscribe({
      next: (crops: any[]) => {
        this.crops = crops;
        if (crops.length > 0) {
          this.farmerName = crops[0].farmerName || '';
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.crops = [];
      }
    });
  }

  requestPurchase(crop: any) {
    const quantity = crop.requestedQuantity;
    if (!quantity || quantity < 1 || quantity > crop.quantityInKg) {
      crop.purchaseMessage = 'Invalid quantity.';
      return;
    }
    const dealer = this.authService.getCurrentUser();
    if (!dealer) {
      crop.purchaseMessage = 'Dealer not logged in.';
      return;
    }
    const request = {
      cropId: crop.cropId,
      dealerId: dealer.userId,
      quantityRequested: quantity
    };
    this.cropPurchaseService.createPurchaseRequest(request).subscribe({
      next: () => {
        crop.purchaseMessage = 'Purchase request sent!';
      },
      error: (err: any) => {
        crop.purchaseMessage = 'Error: ' + (err?.error?.message || 'Could not send request');
      }
    });
  }
}
