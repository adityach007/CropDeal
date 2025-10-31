import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { Farmer } from '../../services/farmer.service';
import { Dealer } from '../../services/dealer.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-admin-edit-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <div class="card">
        <div class="card-header">
          <h3>Edit {{ userType === 'farmer' ? 'Farmer' : 'Dealer' }} Profile</h3>
        </div>
        <div class="card-body">
          <form (ngSubmit)="onSubmit()" #profileForm="ngForm" *ngIf="userType === 'farmer' && farmer">
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
            <button type="submit" class="btn btn-primary me-2" [disabled]="!profileForm.valid || loading">
              {{ loading ? 'Updating...' : 'Update Profile' }}
            </button>
            <button type="button" class="btn btn-secondary" (click)="goBack()">Cancel</button>
          </form>

          <form (ngSubmit)="onSubmit()" #profileForm="ngForm" *ngIf="userType === 'dealer' && dealer">
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
            <button type="submit" class="btn btn-primary me-2" [disabled]="!profileForm.valid || loading">
              {{ loading ? 'Updating...' : 'Update Profile' }}
            </button>
            <button type="button" class="btn btn-secondary" (click)="goBack()">Cancel</button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AdminEditUserComponent implements OnInit {
  userType: 'farmer' | 'dealer' = 'farmer';
  userId!: number;
  farmer?: Farmer;
  dealer?: Dealer;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.userType = params['type'];
      this.userId = +params['id'];
      this.loadUser();
    });
  }

  loadUser() {
    if (this.userType === 'farmer') {
      this.adminService.getFarmerById(this.userId).subscribe({
        next: (data) => this.farmer = data,
        error: (err) => this.toastService.error('Failed to load farmer')
      });
    } else {
      this.adminService.getDealerById(this.userId).subscribe({
        next: (data) => this.dealer = data,
        error: (err) => this.toastService.error('Failed to load dealer')
      });
    }
  }

  onSubmit() {
    this.loading = true;
    if (this.userType === 'farmer' && this.farmer) {
      this.adminService.updateFarmer(this.userId, this.farmer).subscribe({
        next: () => {
          this.toastService.success('Farmer updated successfully');
          this.loading = false;
          this.goBack();
        },
        error: (err) => {
          this.toastService.error('Failed to update farmer');
          this.loading = false;
        }
      });
    } else if (this.userType === 'dealer' && this.dealer) {
      this.adminService.updateDealer(this.userId, this.dealer).subscribe({
        next: () => {
          this.toastService.success('Dealer updated successfully');
          this.loading = false;
          this.goBack();
        },
        error: (err) => {
          this.toastService.error('Failed to update dealer');
          this.loading = false;
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }
}
