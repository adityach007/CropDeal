import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FarmerService, Farmer } from '../../services/farmer.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-farmer-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <div class="card">
        <div class="card-header">
          <h3>Edit Profile</h3>
        </div>
        <div class="card-body">
          <form (ngSubmit)="onSubmit()" #profileForm="ngForm">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Name</label>
                <input type="text" class="form-control" [(ngModel)]="farmer.farmerName" name="farmerName" required>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" [(ngModel)]="farmer.emailAddressFarmer" name="email" required>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Phone Number</label>
                <input type="text" class="form-control" [(ngModel)]="farmer.farmerPhoneNumber" name="phone" maxlength="10" required>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Aadhar Number</label>
                <input type="text" class="form-control" [(ngModel)]="farmer.farmerAadharNumber" name="aadhar" maxlength="12" required>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Bank Account</label>
                <input type="text" class="form-control" [(ngModel)]="farmer.farmerBankAccount" name="bank">
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">IFSC Code</label>
                <input type="text" class="form-control" [(ngModel)]="farmer.farmerIFSCCode" name="ifsc" maxlength="11">
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Location</label>
              <input type="text" class="form-control" [(ngModel)]="farmer.farmerLocation" name="location" required>
            </div>
            <button type="submit" class="btn btn-primary" [disabled]="!profileForm.valid || loading">
              {{ loading ? 'Updating...' : 'Update Profile' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class FarmerProfileComponent implements OnInit {
  farmer: Farmer = {} as Farmer;
  loading = false;

  constructor(
    private farmerService: FarmerService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.farmerService.getFarmerProfile().subscribe({
      next: (data) => this.farmer = data,
      error: (err) => this.toastService.error('Failed to load profile')
    });
  }

  onSubmit() {
    this.loading = true;
    this.farmerService.updateFarmerProfile(this.farmer).subscribe({
      next: () => {
        this.toastService.success('Profile updated successfully');
        this.loading = false;
      },
      error: (err) => {
        this.toastService.error('Failed to update profile');
        this.loading = false;
      }
    });
  }
}
