import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DealerService, Dealer } from '../../services/dealer.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-dealer-profile',
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
                <input type="text" class="form-control" [(ngModel)]="dealer.dealerName" name="dealerName" required>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" [(ngModel)]="dealer.dealerEmailAddress" name="email" required>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Phone Number</label>
                <input type="text" class="form-control" [(ngModel)]="dealer.dealerPhoneNumber" name="phone" maxlength="10" required>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Aadhar Number</label>
                <input type="text" class="form-control" [(ngModel)]="dealer.dealerAadharNumber" name="aadhar" maxlength="10" required>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Bank Account</label>
                <input type="text" class="form-control" [(ngModel)]="dealer.dealerBankAccount" name="bank">
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">IFSC Code</label>
                <input type="text" class="form-control" [(ngModel)]="dealer.dealerIFSCode" name="ifsc">
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Location</label>
              <input type="text" class="form-control" [(ngModel)]="dealer.dealerLocation" name="location" required>
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
export class DealerProfileComponent implements OnInit {
  dealer: Dealer = {} as Dealer;
  loading = false;

  constructor(
    private dealerService: DealerService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.dealerService.getDealerProfile().subscribe({
      next: (data) => this.dealer = data,
      error: (err) => this.toastService.error('Failed to load profile')
    });
  }

  onSubmit() {
    this.loading = true;
    this.dealerService.updateDealerProfile(this.dealer).subscribe({
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
