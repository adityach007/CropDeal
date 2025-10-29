import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="home-container">
      <section class="hero">
        <h1>Welcome to <span class="brand">CropDeal</span></h1>
        <p class="tagline">Your trusted platform for agricultural trade</p>
        <button class="login-button" (click)="login()">Login</button>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(to right, #e8f5e9, #e0f7fa);
      font-family: 'Segoe UI', sans-serif;
    }

    .hero {
      text-align: center;
      padding: 40px;
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      width: 90%;
    }

    h1 {
      font-size: 2.8rem;
      color: #2e7d32;
      margin-bottom: 20px;
    }

    .brand {
      color: #1b5e20;
      font-weight: bold;
    }

    .tagline {
      font-size: 1.2rem;
      color: #555;
      margin-bottom: 30px;
    }

    .login-button {
      padding: 12px 30px;
      font-size: 1.1rem;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .login-button:hover {
      background-color: #388e3c;
    }

    @media screen and (max-width: 600px) {
      h1 {
        font-size: 2rem;
      }

      .tagline {
        font-size: 1rem;
      }

      .login-button {
        width: 100%;
      }
    }
  `]
})
export class HomeComponent {
  constructor(private router: Router) {}

  login() {
    this.router.navigate(['login']);
  }
}