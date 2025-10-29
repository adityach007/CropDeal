import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="landing-container">
      <h1>Welcome to CropDeal</h1>
      <button (click)="navigateToLogin()">Login</button>
    </div>
  `,
  styles: [`
    .landing-container {
      text-align: center;
      padding: 2rem;
    }
  `]
})
export class LandingComponent {
  constructor(private router: Router) {}

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}