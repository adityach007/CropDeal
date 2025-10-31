import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  login() {
    this.loading = true;
    this.error = '';

    this.http.post<any>('http://localhost:5209/api/Auth/login', {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response: any) => {
        if (response.userType === 3) { // Admin userType
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response));
          this.authService.setAuth(response);
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.error = 'Access denied. Admin credentials required.';
          this.loading = false;
        }
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Invalid credentials';
        this.loading = false;
      }
    });
  }
}
