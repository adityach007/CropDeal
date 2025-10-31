import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  userType: number;
  aadharNumber: string;
  bankAccount?: string;
  ifscCode?: string;
  location?: string;
  isActive: boolean;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="register-container">
      <div class="register-box animate-fade-in">
        <div class="register-header">
          <div class="brand-logo">
            <i class="material-icons">agriculture</i>
          </div>
          <h2>Join <span class="brand">CropDeal</span></h2>
          <p class="subtitle">Create your account to start your agricultural journey</p>
        </div>
        
        <div class="user-type-toggle">
          <button 
            type="button"
            class="toggle-btn"
            [class.active]="userType === 'farmer'"
            (click)="setUserType('farmer')"
          >
            <i class="material-icons">person</i>
            <span>Farmer</span>
          </button>
          <button 
            type="button"
            class="toggle-btn"
            [class.active]="userType === 'dealer'"
            (click)="setUserType('dealer')"
          >
            <i class="material-icons">business</i>
            <span>Dealer</span>
          </button>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
          <div class="form-group">
            <label for="name">
              <i class="material-icons">person</i>
              Full Name
            </label>
            <div class="input-wrapper">
              <input
                type="text"
                id="name"
                formControlName="name"
                placeholder="Enter your full name"
                [class.error]="isFieldInvalid('name')"
              />
            </div>
            <div class="error-message" *ngIf="isFieldInvalid('name')">
              <i class="material-icons">error</i>
              Name is required
            </div>
          </div>

          <div class="form-group">
            <label for="email">
              <i class="material-icons">email</i>
              Email Address
            </label>
            <div class="input-wrapper">
              <input
                type="email"
                id="email"
                formControlName="email"
                placeholder="Enter your email address"
                [class.error]="isFieldInvalid('email')"
              />
            </div>
            <div class="error-message" *ngIf="isFieldInvalid('email')">
              <i class="material-icons">error</i>
              Please enter a valid email address
            </div>
          </div>

          <div class="form-group">
            <label for="password">
              <i class="material-icons">lock</i>
              Password
            </label>
            <div class="input-wrapper">
              <input
                type="password"
                id="password"
                formControlName="password"
                placeholder="Enter your password"
                [class.error]="isFieldInvalid('password')"
              />
            </div>
            <div class="error-message" *ngIf="isFieldInvalid('password')">
              <i class="material-icons">error</i>
              Password must be at least 6 characters
            </div>
          </div>

          <div class="form-group">
            <label for="phoneNumber">
              <i class="material-icons">phone</i>
              Phone Number
            </label>
            <div class="input-wrapper">
              <input
                type="tel"
                id="phoneNumber"
                formControlName="phoneNumber"
                placeholder="Enter your phone number"
                [class.error]="isFieldInvalid('phoneNumber')"
              />
            </div>
            <div class="error-message" *ngIf="isFieldInvalid('phoneNumber')">
              <i class="material-icons">error</i>
              Phone number is required
            </div>
          </div>

          <div class="form-group">
            <label for="aadharNumber">
              <i class="material-icons">credit_card</i>
              Aadhar Number
            </label>
            <div class="input-wrapper">
              <input
                type="text"
                id="aadharNumber"
                formControlName="aadharNumber"
                placeholder="Enter your Aadhar number"
                [class.error]="isFieldInvalid('aadharNumber')"
              />
            </div>
            <div class="error-message" *ngIf="isFieldInvalid('aadharNumber')">
              <i class="material-icons">error</i>
              Aadhar number is required
            </div>
          </div>

          <div class="form-group">
            <label for="location">
              <i class="material-icons">location_on</i>
              Location
            </label>
            <div class="input-wrapper">
              <input
                type="text"
                id="location"
                formControlName="location"
                placeholder="Enter your location"
                [class.error]="isFieldInvalid('location')"
              />
            </div>
            <div class="error-message" *ngIf="isFieldInvalid('location')">
              <i class="material-icons">error</i>
              Location is required
            </div>
          </div>

          <div class="form-group">
            <label for="bankAccount">
              <i class="material-icons">account_balance</i>
              Bank Account (Optional)
            </label>
            <div class="input-wrapper">
              <input
                type="text"
                id="bankAccount"
                formControlName="bankAccount"
                placeholder="Enter your bank account number"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="ifscCode">
              <i class="material-icons">code</i>
              IFSC Code (Optional)
            </label>
            <div class="input-wrapper">
              <input
                type="text"
                id="ifscCode"
                formControlName="ifscCode"
                placeholder="Enter your IFSC code"
              />
            </div>
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary btn-lg"
              [disabled]="registerForm.invalid || isLoading"
            >
              <i class="material-icons" *ngIf="!isLoading">person_add</i>
              <div class="spinner" *ngIf="isLoading"></div>
              {{ isLoading ? 'Creating Account...' : 'Create Account' }}
            </button>
          </div>

          <div class="error-message center" *ngIf="errorMessage">
            <i class="material-icons">warning</i>
            {{ errorMessage }}
          </div>
        </form>

        <div class="register-footer">
          <p class="login-link">
            Already have an account? 
            <a routerLink="/login" class="login-btn">
              <i class="material-icons">login</i>
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 50%, var(--primary-100) 100%);
      padding: var(--spacing-lg);
      position: relative;
      overflow: hidden;
    }

    .register-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
      pointer-events: none;
    }

    .register-box {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      padding: var(--spacing-3xl);
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-xl);
      width: 100%;
      max-width: 500px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      z-index: 1;
      max-height: 90vh;
      overflow-y: auto;
    }

    .register-header {
      text-align: center;
      margin-bottom: var(--spacing-2xl);
    }

    .brand-logo {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--spacing-lg);
      box-shadow: var(--shadow-lg);
    }

    .brand-logo i {
      color: white;
      font-size: 2.5rem;
    }

    h2 {
      color: var(--gray-900);
      margin-bottom: var(--spacing-md);
      font-size: var(--font-size-2xl);
      font-weight: 600;
    }

    .brand {
      background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 700;
    }

    .subtitle {
      color: var(--gray-600);
      font-size: var(--font-size-base);
      margin-bottom: 0;
    }

    .user-type-toggle {
      display: flex;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-2xl);
      padding: var(--spacing-xs);
      background: var(--gray-100);
      border-radius: var(--radius-lg);
    }

    .toggle-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      border: none;
      border-radius: var(--radius-md);
      background: transparent;
      cursor: pointer;
      transition: all var(--transition-fast);
      color: var(--gray-600);
      font-weight: 500;
      font-size: var(--font-size-sm);
    }

    .toggle-btn i {
      font-size: 1.2rem;
    }

    .toggle-btn.active {
      background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
      color: white;
      box-shadow: var(--shadow-sm);
      transform: translateY(-1px);
    }

    .toggle-btn:hover:not(.active) {
      background: var(--gray-200);
      color: var(--gray-700);
    }

    .form-group {
      margin-bottom: var(--spacing-lg);
    }

    label {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
      color: var(--gray-700);
      font-weight: 500;
      font-size: var(--font-size-sm);
    }

    label i {
      font-size: 1.1rem;
      color: var(--primary-600);
    }

    .input-wrapper {
      position: relative;
    }

    input {
      width: 100%;
      padding: var(--spacing-md);
      border: 2px solid var(--gray-300);
      border-radius: var(--radius-lg);
      font-size: var(--font-size-base);
      transition: all var(--transition-fast);
      background: white;
      font-family: inherit;
    }

    input:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
    }

    input.error {
      border-color: var(--error);
      box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
    }

    .error-message {
      color: var(--error);
      font-size: var(--font-size-sm);
      margin-top: var(--spacing-sm);
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
    }

    .error-message.center {
      justify-content: center;
      margin-top: var(--spacing-lg);
      padding: var(--spacing-md);
      background: rgba(244, 67, 54, 0.1);
      border-radius: var(--radius-md);
    }

    .error-message i {
      font-size: 1rem;
    }

    .form-actions {
      margin-bottom: var(--spacing-lg);
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .register-footer {
      text-align: center;
      padding-top: var(--spacing-lg);
      border-top: 1px solid var(--gray-200);
    }

    .login-link {
      color: var(--gray-600);
      font-size: var(--font-size-sm);
      margin: 0;
    }

    .login-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
      color: var(--primary-600);
      text-decoration: none;
      font-weight: 500;
      transition: color var(--transition-fast);
    }

    .login-btn:hover {
      color: var(--primary-700);
      text-decoration: none;
    }

    .login-btn i {
      font-size: 1rem;
    }

    /* Responsive Design */
    @media (max-width: 480px) {
      .register-container {
        padding: var(--spacing-md);
      }

      .register-box {
        padding: var(--spacing-xl);
      }

      .toggle-btn span {
        display: none;
      }

      .toggle-btn {
        padding: var(--spacing-md) var(--spacing-sm);
      }
    }
  `]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  userType: 'farmer' | 'dealer' = 'farmer';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(40)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: ['', [Validators.required, Validators.maxLength(10)]],
      aadharNumber: ['', [Validators.required, Validators.maxLength(12)]],
      location: ['', Validators.required],
      bankAccount: ['', Validators.maxLength(20)],
      ifscCode: ['', Validators.maxLength(11)]
    });
  }

  ngOnInit(): void {
    // If user is already logged in, redirect to appropriate dashboard
    if (this.authService.isLoggedIn()) {
      const user = this.authService.getCurrentUser();
      if (user?.userType === 1) {
        this.router.navigate(['/farmer/dashboard']);
      } else if (user?.userType === 2) {
        this.router.navigate(['/dealer/dashboard']);
      }
    }
  }

  setUserType(type: 'farmer' | 'dealer') {
    this.userType = type;
    this.errorMessage = '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const registerData: RegisterRequest = {
        ...this.registerForm.value,
        userType: this.userType === 'farmer' ? 1 : 2,
        isActive: true
      };

      console.log('Attempting registration with:', registerData);

      this.authService.register(registerData).subscribe({
        next: (response) => {
          console.log('Registration response:', response);
          this.isLoading = false;
          this.toast.success('Registration successful! Welcome to CropDeal.');
          
          // Redirect to appropriate dashboard based on user type
          if (response.userType === 1) {
            this.router.navigate(['/farmer/dashboard']);
          } else if (response.userType === 2) {
            this.router.navigate(['/dealer/dashboard']);
          }
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.isLoading = false;
          this.errorMessage = error.error?.message || error.error || 'An error occurred during registration. Please try again.';
          this.toast.error(this.errorMessage);
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}