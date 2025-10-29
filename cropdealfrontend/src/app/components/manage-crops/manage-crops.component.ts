import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CropsService, Crop } from '../../services/crops.service';

@Component({
  selector: 'app-manage-crops',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="crops-management">
      <!-- Add/Edit Crop Form -->
      <div class="crop-form-container">
        <h2>{{ editingCropId ? 'Edit Crop' : 'Add New Crop' }}</h2>
        <form [formGroup]="cropForm" (ngSubmit)="onSubmit()" class="crop-form">
          <div class="form-group">
            <label for="cropName">Crop Name</label>
            <input
              type="text"
              id="cropName"
              formControlName="cropName"
              placeholder="Enter crop name"
              [class.error]="isFieldInvalid('cropName')"
            />
            <div class="error-message" *ngIf="isFieldInvalid('cropName')">
              Crop name is required
            </div>
          </div>

          <div class="form-group">
            <label for="cropType">Crop Type</label>
            <select id="cropType" formControlName="cropType" [class.error]="isFieldInvalid('cropType')">
              <option value="">Select type</option>
              <option value="Vegetable">Vegetable</option>
              <option value="Fruit">Fruit</option>
              <option value="Grain">Grain</option>
            </select>
            <div class="error-message" *ngIf="isFieldInvalid('cropType')">
              Crop type is required
            </div>
          </div>

          <div class="form-group">
            <label for="quantityInKg">Quantity (kg)</label>
            <input
              type="number"
              id="quantityInKg"
              formControlName="quantityInKg"
              placeholder="Enter quantity"
              [class.error]="isFieldInvalid('quantityInKg')"
            />
            <div class="error-message" *ngIf="isFieldInvalid('quantityInKg')">
              Valid quantity is required
            </div>
          </div>

          <div class="form-group">
            <label for="pricePerUnit">Price per kg (₹)</label>
            <input
              type="number"
              id="pricePerUnit"
              formControlName="pricePerUnit"
              placeholder="Enter price"
              [class.error]="isFieldInvalid('pricePerUnit')"
            />
            <div class="error-message" *ngIf="isFieldInvalid('pricePerUnit')">
              Valid price is required
            </div>
          </div>

          <div class="form-group">
            <label for="location">Location</label>
            <input
              type="text"
              id="location"
              formControlName="location"
              placeholder="Enter location"
              [class.error]="isFieldInvalid('location')"
            />
            <div class="error-message" *ngIf="isFieldInvalid('location')">
              Location is required
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" [disabled]="cropForm.invalid || isSubmitting">
              {{ isSubmitting ? 'Saving...' : (editingCropId ? 'Update Crop' : 'Add Crop') }}
            </button>
            <button type="button" *ngIf="editingCropId" (click)="cancelEdit()" class="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- Crops List -->
      <div class="crops-list">
        <h2>My Crops</h2>
        <div class="crops-grid">
          <div *ngFor="let crop of crops" class="crop-card">
            <div class="crop-header">
              <h3>{{crop.cropName}}</h3>
              <span class="crop-type">{{crop.cropType}}</span>
            </div>
            <div class="crop-details">
              <p><strong>Quantity:</strong> {{crop.quantityInKg}} kg</p>
              <p><strong>Price:</strong> ₹{{crop.pricePerUnit}}/kg</p>
              <p><strong>Location:</strong> {{crop.location}}</p>
            </div>
            <div class="crop-actions">
              <button class="edit-btn" (click)="editCrop(crop)">Edit</button>
              <button class="delete-btn" (click)="deleteCrop(crop.cropId)">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .crops-management {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 20px;
    }

    .crop-form-container {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .crop-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    label {
      font-weight: 500;
      color: #333;
    }

    input, select {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    input.error, select.error {
      border-color: #f44336;
    }

    .error-message {
      color: #f44336;
      font-size: 0.875rem;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }

    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    button[type="submit"] {
      background-color: #4CAF50;
      color: white;
    }

    .cancel-btn {
      background-color: #f5f5f5;
      color: #333;
    }

    .crops-list {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .crops-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .crop-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
    }

    .crop-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .crop-type {
      background: #e8f5e9;
      color: #2e7d32;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .crop-details {
      margin-bottom: 15px;
    }

    .crop-details p {
      margin: 5px 0;
      color: #555;
    }

    .crop-actions {
      display: flex;
      gap: 10px;
    }

    .edit-btn {
      background-color: #2196f3;
      color: white;
    }

    .delete-btn {
      background-color: #f44336;
      color: white;
    }

    @media (max-width: 768px) {
      .crops-management {
        grid-template-columns: 1fr;
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
    private cropsService: CropsService
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
          },
          error: (error) => {
            console.error('Error updating crop:', error);
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
          },
          error: (error) => {
            console.error('Error creating crop:', error);
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
        },
        error: (error) => {
          console.error('Error deleting crop:', error);
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
}
