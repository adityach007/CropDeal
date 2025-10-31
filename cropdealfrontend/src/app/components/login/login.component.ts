import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="login-box animate-fade-in">
        <div class="login-header">
          <div class="brand-logo">
            <i class="material-icons">agriculture</i>
          </div>
          <h2>Welcome Back to <span class="brand">CropDeal</span></h2>
          <p class="subtitle">Sign in to continue your agricultural journey</p>
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
          <button 
            type="button"
            class="toggle-btn"
            [class.active]="userType === 'admin'"
            (click)="setUserType('admin')"
          >
            <i class="material-icons">admin_panel_settings</i>
            <span>Admin</span>
          </button>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
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
              Password is required
            </div>
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary btn-lg"
              [disabled]="loginForm.invalid || isLoading"
            >
              <i class="material-icons" *ngIf="!isLoading">login</i>
              <div class="spinner" *ngIf="isLoading"></div>
              {{ isLoading ? 'Signing in...' : 'Sign In' }}
            </button>
          </div>

          <div class="error-message center" *ngIf="errorMessage">
            <i class="material-icons">warning</i>
            {{ errorMessage }}
          </div>
        </form>

        <div class="login-footer">
          <p class="register-link">
            Don't have an account? 
            <a routerLink="/register" class="register-btn">
              <i class="material-icons">person_add</i>
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 50%, var(--primary-100) 100%);
      padding: var(--spacing-lg);
      position: relative;
      overflow: hidden;
    }

    .login-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
      pointer-events: none;
    }

    .login-box {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      padding: var(--spacing-3xl);
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-xl);
      width: 100%;
      max-width: 450px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      z-index: 1;
    }

    .login-header {
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
      margin-bottom: var(--spacing-xl);
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
      padding: var(--spacing-lg);
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

    .login-footer {
      text-align: center;
      padding-top: var(--spacing-lg);
      border-top: 1px solid var(--gray-200);
    }

    .register-link {
      color: var(--gray-600);
      font-size: var(--font-size-sm);
      margin: 0;
    }

    .register-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
      color: var(--primary-600);
      text-decoration: none;
      font-weight: 500;
      transition: color var(--transition-fast);
    }

    .register-btn:hover {
      color: var(--primary-700);
      text-decoration: none;
    }

    .register-btn i {
      font-size: 1rem;
    }

    /* Responsive Design */
    @media (max-width: 480px) {
      .login-container {
        padding: var(--spacing-md);
      }

      .login-box {
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
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  userType: 'farmer' | 'dealer' | 'admin' = 'farmer';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
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

  setUserType(type: 'farmer' | 'dealer' | 'admin') {
    this.userType = type;
    this.errorMessage = '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      console.log('Attempting login with:', this.loginForm.value);

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Login response:', response);
          this.isLoading = false;
          
          // Check if user type matches selected type
          if ((this.userType === 'farmer' && response.userType === 1) ||
              (this.userType === 'dealer' && response.userType === 2) ||
              (this.userType === 'admin' && response.userType === 3)) {
            this.toast.success('Login successful! Welcome back.');
            if (response.userType === 1) {
              this.router.navigate(['/farmer/dashboard']);
            } else if (response.userType === 2) {
              this.router.navigate(['/dealer/dashboard']);
            } else if (response.userType === 3) {
              this.router.navigate(['/admin/dashboard']);
            }
          } else {
            this.errorMessage = `Invalid credentials for ${this.userType}. Please check your email and password.`;
            this.toast.error(this.errorMessage);
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'An error occurred during login. Please try again.';
          this.toast.error(this.errorMessage);
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
