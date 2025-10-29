import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="login-box">
        <h2>Welcome Back to <span class="brand">CropDeal</span></h2>
        <p class="subtitle">Sign in to continue</p>
        
        <div class="user-type-toggle">
          <button 
            type="button"
            [class.active]="userType === 'farmer'"
            (click)="setUserType('farmer')"
          >
            Farmer
          </button>
          <button 
            type="button"
            [class.active]="userType === 'dealer'"
            (click)="setUserType('dealer')"
          >
            Dealer
          </button>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              placeholder="Enter your email"
              [class.error]="isFieldInvalid('email')"
            />
            <div class="error-message" *ngIf="isFieldInvalid('email')">
              Please enter a valid email address
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              placeholder="Enter your password"
              [class.error]="isFieldInvalid('password')"
            />
            <div class="error-message" *ngIf="isFieldInvalid('password')">
              Password is required
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" [disabled]="loginForm.invalid || isLoading">
              {{ isLoading ? 'Signing in...' : 'Sign In' }}
            </button>
          </div>

          <div class="error-message center" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>
        </form>

        <p class="register-link">
          Don't have an account? <a routerLink="/register">Register here</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(to right, #e8f5e9, #e0f7fa);
      padding: 20px;
    }

    .login-box {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }

    h2 {
      color: #2e7d32;
      margin-bottom: 10px;
      text-align: center;
      font-size: 1.8rem;
    }

    .brand {
      color: #1b5e20;
      font-weight: bold;
    }

    .subtitle {
      color: #666;
      text-align: center;
      margin-bottom: 30px;
    }

    .user-type-toggle {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      padding: 5px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .user-type-toggle button {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 6px;
      background: none;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #666;
      font-weight: 500;
    }

    .user-type-toggle button.active {
      background: #4CAF50;
      color: white;
    }

    .user-type-toggle button:hover:not(.active) {
      background: #e0e0e0;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      color: #333;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    input:focus {
      outline: none;
      border-color: #4CAF50;
    }

    input.error {
      border-color: #f44336;
    }

    .error-message {
      color: #f44336;
      font-size: 0.875rem;
      margin-top: 4px;
    }

    .error-message.center {
      text-align: center;
    }

    button[type="submit"] {
      width: 100%;
      padding: 12px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    button[type="submit"]:hover:not(:disabled) {
      background-color: #388e3c;
    }

    button[type="submit"]:disabled {
      background-color: #9e9e9e;
      cursor: not-allowed;
    }

    .register-link {
      margin-top: 20px;
      text-align: center;
      color: #666;
    }

    .register-link a {
      color: #4CAF50;
      text-decoration: none;
      font-weight: 500;
    }

    .register-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  userType: 'farmer' | 'dealer' = 'farmer';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
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

  setUserType(type: 'farmer' | 'dealer') {
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
              (this.userType === 'dealer' && response.userType === 2)) {
            if (response.userType === 1) {
              this.router.navigate(['/farmer/dashboard']);
            } else {
              this.router.navigate(['/dealer/dashboard']);
            }
          } else {
            this.errorMessage = `Invalid credentials for ${this.userType}. Please check your email and password.`;
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'An error occurred during login. Please try again.';
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
