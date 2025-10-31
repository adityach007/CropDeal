import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CropsService, Crop } from '../../services/crops.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-manage-crops',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="crops-management">
      <!-- Header Section -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">
            <span class="title-icon">🌾</span>
            Manage Your Crops
          </h1>
          <p class="page-subtitle">Add, edit, and manage your crop inventory</p>
        </div>
      </div>

      <div class="content-wrapper">
        <!-- Add/Edit Crop Form -->
        <div class="crop-form-container">
          <div class="form-header">
            <h2 class="form-title">
              <span class="form-icon">{{ editingCropId ? '✏️' : '➕' }}</span>
              {{ editingCropId ? 'Edit Crop' : 'Add New Crop' }}
            </h2>
          </div>
          
          <form [formGroup]="cropForm" (ngSubmit)="onSubmit()" class="crop-form">
            <div class="form-row">
              <div class="form-group">
                <label for="cropName" class="form-label">
                  <span class="label-icon">🌱</span>
                  Crop Name
                </label>
                <input
                  type="text"
                  id="cropName"
                  formControlName="cropName"
                  placeholder="e.g., Tomatoes, Rice, Wheat"
                  class="form-input"
                  [class.error]="isFieldInvalid('cropName')"
                />
                <div class="error-message" *ngIf="isFieldInvalid('cropName')">
                  <span class="error-icon">⚠️</span>
                  Crop name is required
                </div>
              </div>

              <div class="form-group">
                <label for="cropType" class="form-label">
                  <span class="label-icon">🏷️</span>
                  Crop Type
                </label>
                <select id="cropType" formControlName="cropType" class="form-select" [class.error]="isFieldInvalid('cropType')">
                  <option value="">Select crop type</option>
                  <option value="Vegetable">🥬 Vegetable</option>
                  <option value="Fruit">🍎 Fruit</option>
                  <option value="Grain">🌾 Grain</option>
                </select>
                <div class="error-message" *ngIf="isFieldInvalid('cropType')">
                  <span class="error-icon">⚠️</span>
                  Crop type is required
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="quantityInKg" class="form-label">
                  <span class="label-icon">⚖️</span>
                  Quantity (kg)
                </label>
                <input
                  type="number"
                  id="quantityInKg"
                  formControlName="quantityInKg"
                  placeholder="Enter quantity in kg"
                  class="form-input"
                  [class.error]="isFieldInvalid('quantityInKg')"
                />
                <div class="error-message" *ngIf="isFieldInvalid('quantityInKg')">
                  <span class="error-icon">⚠️</span>
                  Valid quantity is required
                </div>
              </div>

              <div class="form-group">
                <label for="pricePerUnit" class="form-label">
                  <span class="label-icon">💰</span>
                  Price per kg (₹)
                </label>
                <input
                  type="number"
                  id="pricePerUnit"
                  formControlName="pricePerUnit"
                  placeholder="Enter price per kg"
                  class="form-input"
                  [class.error]="isFieldInvalid('pricePerUnit')"
                />
                <div class="error-message" *ngIf="isFieldInvalid('pricePerUnit')">
                  <span class="error-icon">⚠️</span>
                  Valid price is required
                </div>
              </div>
            </div>

            <div class="form-group full-width">
              <label for="location" class="form-label">
                <span class="label-icon">📍</span>
                Location
              </label>
              <input
                type="text"
                id="location"
                formControlName="location"
                placeholder="Enter farm location or address"
                class="form-input"
                [class.error]="isFieldInvalid('location')"
              />
              <div class="error-message" *ngIf="isFieldInvalid('location')">
                <span class="error-icon">⚠️</span>
                Location is required
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="cropForm.invalid || isSubmitting">
                <span class="btn-icon">{{ isSubmitting ? '⏳' : (editingCropId ? '💾' : '➕') }}</span>
                {{ isSubmitting ? 'Saving...' : (editingCropId ? 'Update Crop' : 'Add Crop') }}
              </button>
              <button type="button" *ngIf="editingCropId" (click)="cancelEdit()" class="btn btn-secondary">
                <span class="btn-icon">❌</span>
                Cancel
              </button>
            </div>
          </form>
        </div>

        <!-- Crops List -->
        <div class="crops-list">
          <div class="list-header">
            <h2 class="list-title">
              <span class="title-icon">📋</span>
              My Crops
              <span class="crop-count" *ngIf="crops.length > 0">({{ crops.length }})</span>
            </h2>
          </div>
          
          <div class="crops-grid" *ngIf="crops.length > 0">
            <div *ngFor="let crop of crops; trackBy: trackByCropId" class="crop-card">
              <div class="crop-card-header">
                <div class="crop-title-section">
                  <h3 class="crop-name">{{ crop.cropName }}</h3>
                  <span class="crop-type-badge" [class]="'type-' + crop.cropType.toLowerCase()">
                    {{ getCropTypeIcon(crop.cropType) }} {{ crop.cropType }}
                  </span>
                </div>
              </div>
              
              <div class="crop-details">
                <div class="detail-item">
                  <span class="detail-icon">⚖️</span>
                  <span class="detail-label">Quantity:</span>
                  <span class="detail-value">{{ crop.quantityInKg }} kg</span>
                </div>
                <div class="detail-item">
                  <span class="detail-icon">💰</span>
                  <span class="detail-label">Price:</span>
                  <span class="detail-value">₹{{ crop.pricePerUnit }}/kg</span>
                </div>
                <div class="detail-item">
                  <span class="detail-icon">📍</span>
                  <span class="detail-label">Location:</span>
                  <span class="detail-value">{{ crop.location }}</span>
                </div>
                <div class="detail-item total-value">
                  <span class="detail-icon">💵</span>
                  <span class="detail-label">Total Value:</span>
                  <span class="detail-value highlight">₹{{ (crop.quantityInKg * crop.pricePerUnit) | number:'1.0-0' }}</span>
                </div>
              </div>
              
              <div class="crop-actions">
                <button class="btn btn-edit" (click)="editCrop(crop)" title="Edit crop">
                  <span class="btn-icon">✏️</span>
                  Edit
                </button>
                <button class="btn btn-delete" (click)="deleteCrop(crop.cropId)" title="Delete crop">
                  <span class="btn-icon">🗑️</span>
                  Delete
                </button>
              </div>
            </div>
          </div>
          
          <div class="empty-state" *ngIf="crops.length === 0">
            <div class="empty-icon">🌾</div>
            <h3>No crops added yet</h3>
            <p>Start by adding your first crop using the form above</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .crops-management {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 0;
    }

    .page-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem 0;
      margin-bottom: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      text-align: center;
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }

    .title-icon {
      font-size: 3rem;
    }

    .page-subtitle {
      font-size: 1.1rem;
      opacity: 0.9;
      margin: 0;
    }

    .content-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem 2rem;
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 2rem;
    }

    .crop-form-container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      overflow: hidden;
      height: fit-content;
      position: sticky;
      top: 2rem;
    }

    .form-header {
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      color: white;
      padding: 1.5rem 2rem;
    }

    .form-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .form-icon {
      font-size: 1.5rem;
    }

    .crop-form {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-label {
      font-weight: 600;
      color: #333;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .label-icon {
      font-size: 1rem;
    }

    .form-input, .form-select {
      padding: 0.75rem 1rem;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: white;
    }

    .form-input:focus, .form-select:focus {
      outline: none;
      border-color: #4CAF50;
      box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
    }

    .form-input.error, .form-select.error {
      border-color: #f44336;
      box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
    }

    .error-message {
      color: #f44336;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      margin-top: 0.25rem;
    }

    .error-icon {
      font-size: 0.875rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
      text-decoration: none;
    }

    .btn-icon {
      font-size: 1rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      color: white;
      flex: 1;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #666;
      border: 2px solid #e1e5e9;
    }

    .btn-secondary:hover {
      background: #e9ecef;
      transform: translateY(-1px);
    }

    .crops-list {
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .list-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem 2rem;
    }

    .list-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .crop-count {
      background: rgba(255,255,255,0.2);
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      margin-left: 0.5rem;
    }

    .crops-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
      padding: 2rem;
    }

    .crop-card {
      background: white;
      border-radius: 12px;
      border: 1px solid #e1e5e9;
      overflow: hidden;
      transition: all 0.3s ease;
      position: relative;
    }

    .crop-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.15);
    }

    .crop-card-header {
      padding: 1.5rem 1.5rem 1rem;
      border-bottom: 1px solid #f0f0f0;
    }

    .crop-title-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .crop-name {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: #333;
    }

    .crop-type-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
      width: fit-content;
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

    .crop-details {
      padding: 1rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.95rem;
    }

    .detail-item.total-value {
      margin-top: 0.5rem;
      padding-top: 0.75rem;
      border-top: 1px solid #f0f0f0;
      font-weight: 600;
    }

    .detail-icon {
      font-size: 1rem;
      width: 20px;
      text-align: center;
    }

    .detail-label {
      color: #666;
      min-width: 80px;
    }

    .detail-value {
      color: #333;
      font-weight: 500;
    }

    .detail-value.highlight {
      color: #4CAF50;
      font-weight: 700;
      font-size: 1.1rem;
    }

    .crop-actions {
      padding: 1rem 1.5rem;
      background: #f8f9fa;
      display: flex;
      gap: 0.75rem;
    }

    .btn-edit {
      background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
      color: white;
      flex: 1;
      justify-content: center;
      padding: 0.75rem;
    }

    .btn-edit:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
    }

    .btn-delete {
      background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
      color: white;
      flex: 1;
      justify-content: center;
      padding: 0.75rem;
    }

    .btn-delete:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      color: #333;
    }

    .empty-state p {
      margin: 0;
      font-size: 1rem;
      opacity: 0.8;
    }

    @media (max-width: 1024px) {
      .content-wrapper {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
      
      .crop-form-container {
        position: static;
      }
    }

    @media (max-width: 768px) {
      .page-title {
        font-size: 2rem;
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .title-icon {
        font-size: 2.5rem;
      }
      
      .content-wrapper {
        padding: 0 1rem 1rem;
      }
      
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .crops-grid {
        grid-template-columns: 1fr;
        padding: 1rem;
      }
      
      .form-actions {
        flex-direction: column;
      }
    }

    @media (max-width: 480px) {
      .crop-form {
        padding: 1.5rem;
      }
      
      .crop-actions {
        flex-direction: column;
      }
    }
  `]
})
export class ManageCropsComponent implements OnInit {
  cropForm: FormGroup;
  crops: Crop[] = [];
  editingCropId: number | null = null;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private cropsService: CropsService,
    private toast: ToastService
  ) {
    this.cropForm = this.createForm();
  }

  ngOnInit() {
    this.loadCrops();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      cropName: ['', [Validators.required]],
      cropType: ['', [Validators.required]],
      quantityInKg: ['', [Validators.required, Validators.min(1)]],
      pricePerUnit: ['', [Validators.required, Validators.min(1)]],
      location: ['', [Validators.required]]
    });
  }

  private loadCrops() {
    this.cropsService.getMyCrops().subscribe({
      next: (crops) => {
        this.crops = crops;
      },
      error: (error) => {
        console.error('Error loading crops:', error);
        this.toast.error('Failed to load crops');
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.cropForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.cropForm.valid) {
      this.isSubmitting = true;
      const cropData = this.cropForm.value;

      if (this.editingCropId) {
        this.cropsService.updateCrop(this.editingCropId, {
          cropId: this.editingCropId,
          ...cropData
        }).subscribe({
          next: () => {
            this.loadCrops();
            this.resetForm();
            this.toast.success('Crop updated successfully!');
          },
          error: (error) => {
            console.error('Error updating crop:', error);
            this.toast.error('Failed to update crop');
          },
          complete: () => {
            this.isSubmitting = false;
          }
        });
      } else {
        this.cropsService.createCrop(cropData).subscribe({
          next: () => {
            this.loadCrops();
            this.resetForm();
            this.toast.success('Crop added successfully!');
          },
          error: (error) => {
            console.error('Error creating crop:', error);
            this.toast.error('Failed to add crop');
          },
          complete: () => {
            this.isSubmitting = false;
          }
        });
      }
    } else {
      this.cropForm.markAllAsTouched();
    }
  }

  editCrop(crop: Crop) {
    this.editingCropId = crop.cropId;
    this.cropForm.patchValue({
      cropName: crop.cropName,
      cropType: crop.cropType,
      quantityInKg: crop.quantityInKg,
      pricePerUnit: crop.pricePerUnit,
      location: crop.location
    });
  }

  deleteCrop(cropId: number) {
    if (confirm('Are you sure you want to delete this crop?')) {
      this.cropsService.deleteCrop(cropId).subscribe({
        next: () => {
          this.loadCrops();
          this.toast.success('Crop deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting crop:', error);
          this.toast.error('Failed to delete crop');
        }
      });
    }
  }

  cancelEdit() {
    this.editingCropId = null;
    this.resetForm();
  }

  private resetForm() {
    this.cropForm.reset();
    this.editingCropId = null;
    this.isSubmitting = false;
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
