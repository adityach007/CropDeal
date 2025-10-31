import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FarmerService, Farmer } from '../../services/farmer.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="landing-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content animate-fade-in">
          <div class="hero-text">
            <h1 class="hero-title">
              Welcome to <span class="brand-highlight">CropDeal</span>
            </h1>
            <p class="hero-subtitle">
              Connecting farmers and dealers for seamless crop trading.
              Fresh produce, fair prices, direct connections.
            </p>
            <div class="hero-actions">
              <button class="btn btn-primary btn-lg" (click)="navigateToLogin()">
                <i class="material-icons">login</i>
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Marketplace Section -->
      <section class="marketplace-section">
        <div class="container">
          <div class="section-header text-center">
            <h2>Featured Farmers</h2>
            <p class="section-subtitle">Connect with verified farmers across the region</p>
          </div>

          <div *ngIf="loading" class="loading-state">
            <i class="material-icons spinning">refresh</i>
            <p>Loading farmers...</p>
          </div>

          <div *ngIf="!loading && farmers.length === 0" class="empty-state">
            <i class="material-icons">agriculture</i>
            <p>No farmers available at the moment</p>
          </div>

          <div class="farmers-grid" *ngIf="!loading && farmers.length > 0">
            <div class="farmer-card" *ngFor="let farmer of farmers">
              <div class="farmer-header">
                <div class="farmer-avatar">
                  <i class="material-icons">person</i>
                </div>
                <div class="farmer-info">
                  <h3>
                    {{ farmer.farmerName }}
                    <span class="verified-badge" *ngIf="farmer.isVerified">
                      <i class="material-icons">verified</i>
                    </span>
                  </h3>
                  <p class="location">
                    <i class="material-icons">location_on</i>
                    {{ farmer.farmerLocation }}
                  </p>
                </div>
              </div>
              <div class="farmer-details">
                <div class="detail-item">
                  <i class="material-icons">email</i>
                  <span>{{ farmer.emailAddressFarmer }}</span>
                </div>
                <div class="detail-item">
                  <i class="material-icons">phone</i>
                  <span>{{ farmer.farmerPhoneNumber }}</span>
                </div>
                <div class="detail-item">
                  <i class="material-icons">people</i>
                  <span>{{ farmer.subscriberCount }} Subscribers</span>
                </div>
              </div>
              <div class="farmer-actions">
                <button class="btn btn-primary btn-sm" (click)="navigateToLogin()">
                  <i class="material-icons">login</i>
                  Login to Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="features-section">
        <div class="container">
          <div class="section-header text-center">
            <h2>Why Choose CropDeal?</h2>
            <p class="section-subtitle">
              Revolutionizing agricultural trade with modern technology
            </p>
          </div>
          
          <div class="features-grid">
            <div class="feature-card animate-fade-in">
              <div class="feature-icon">
                <i class="material-icons">person</i>
              </div>
              <h3>For Farmers</h3>
              <ul>
                <li>List your crops easily</li>
                <li>Get fair market prices</li>
                <li>Direct buyer connections</li>
                <li>Secure payment system</li>
              </ul>
            </div>
            
            <div class="feature-card animate-fade-in">
              <div class="feature-icon">
                <i class="material-icons">business</i>
              </div>
              <h3>For Dealers</h3>
              <ul>
                <li>Browse quality crops</li>
                <li>Connect with farmers</li>
                <li>Bulk purchase options</li>
                <li>Review and rating system</li>
              </ul>
            </div>
            
            <div class="feature-card animate-fade-in">
              <div class="feature-icon">
                <i class="material-icons">security</i>
              </div>
              <h3>Secure & Reliable</h3>
              <ul>
                <li>Verified user profiles</li>
                <li>Secure transactions</li>
                <li>Quality assurance</li>
                <li>24/7 support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="container text-center">
          <h2>Ready to Start Trading?</h2>
          <p>Join thousands of farmers and dealers already using CropDeal</p>
          <div class="cta-actions">
            <button class="btn btn-primary btn-lg" (click)="navigateToLogin()">
              <i class="material-icons">login</i>
              Login Now
            </button>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <div class="container text-center">
          <p>&copy; 2024 CropDeal. Connecting agriculture with technology.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .landing-page {
      min-height: 100vh;
      overflow-x: hidden;
    }

    .hero-section {
      min-height: 60vh;
      display: flex;
      align-items: center;
      background: linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 50%, var(--primary-100) 100%);
      position: relative;
      overflow: hidden;
    }

    .hero-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
      pointer-events: none;
    }

    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--spacing-xl);
      text-align: center;
      position: relative;
      z-index: 1;
    }

    .hero-title {
      font-size: 3.5rem;
      font-weight: 700;
      line-height: 1.1;
      margin-bottom: var(--spacing-lg);
      color: var(--gray-900);
    }

    .brand-highlight {
      background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: var(--font-size-xl);
      color: var(--gray-600);
      margin-bottom: var(--spacing-2xl);
      line-height: 1.6;
    }

    .hero-actions {
      display: flex;
      gap: var(--spacing-lg);
      flex-wrap: wrap;
      justify-content: center;
    }

    .marketplace-section {
      padding: var(--spacing-3xl) 0;
      background: var(--gray-50);
    }

    .farmers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--spacing-xl);
      margin-top: var(--spacing-2xl);
    }

    .farmer-card {
      background: white;
      border-radius: var(--radius-2xl);
      padding: var(--spacing-xl);
      box-shadow: var(--shadow-md);
      transition: all var(--transition-normal);
      border: 1px solid var(--gray-200);
    }

    .farmer-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-xl);
      border-color: var(--primary-300);
    }

    .farmer-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
      padding-bottom: var(--spacing-lg);
      border-bottom: 1px solid var(--gray-200);
    }

    .farmer-avatar {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .farmer-avatar i {
      color: white;
      font-size: 2rem;
    }

    .farmer-info h3 {
      margin: 0 0 var(--spacing-xs);
      color: var(--gray-900);
      font-size: var(--font-size-lg);
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
    }

    .verified-badge {
      display: inline-flex;
      align-items: center;
    }

    .verified-badge i {
      color: var(--primary-600);
      font-size: 1.2rem;
    }

    .farmer-info .location {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      color: var(--gray-600);
      font-size: var(--font-size-sm);
      margin: 0;
    }

    .farmer-info .location i {
      font-size: 1rem;
    }

    .farmer-details {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      color: var(--gray-700);
      font-size: var(--font-size-sm);
    }

    .detail-item i {
      color: var(--primary-600);
      font-size: 1.2rem;
    }

    .farmer-actions {
      display: flex;
      gap: var(--spacing-sm);
    }

    .farmer-actions .btn {
      flex: 1;
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: var(--spacing-3xl);
      color: var(--gray-600);
    }

    .loading-state i, .empty-state i {
      font-size: 4rem;
      color: var(--primary-400);
      margin-bottom: var(--spacing-md);
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .features-section {
      padding: var(--spacing-3xl) 0;
      background: white;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--spacing-xl);
    }

    .section-header {
      margin-bottom: var(--spacing-3xl);
    }

    .section-header h2 {
      font-size: var(--font-size-3xl);
      color: var(--gray-900);
      margin-bottom: var(--spacing-md);
    }

    .section-subtitle {
      font-size: var(--font-size-lg);
      color: var(--gray-600);
      max-width: 600px;
      margin: 0 auto;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--spacing-2xl);
    }

    .feature-card {
      background: white;
      padding: var(--spacing-2xl);
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-md);
      text-align: center;
      transition: all var(--transition-normal);
      border: 1px solid var(--gray-200);
    }

    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
      border-color: var(--primary-200);
    }

    .feature-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, var(--primary-100), var(--primary-200));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--spacing-lg);
    }

    .feature-icon i {
      color: var(--primary-700);
      font-size: 2.5rem;
    }

    .feature-card h3 {
      color: var(--gray-900);
      margin-bottom: var(--spacing-lg);
      font-size: var(--font-size-xl);
    }

    .feature-card ul {
      list-style: none;
      text-align: left;
    }

    .feature-card li {
      padding: var(--spacing-sm) 0;
      color: var(--gray-700);
      position: relative;
      padding-left: var(--spacing-lg);
    }

    .feature-card li::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: var(--primary-600);
      font-weight: bold;
    }

    .cta-section {
      padding: var(--spacing-3xl) 0;
      background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
      color: white;
    }

    .cta-section h2 {
      color: white;
      font-size: var(--font-size-3xl);
      margin-bottom: var(--spacing-md);
    }

    .cta-section p {
      font-size: var(--font-size-lg);
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: var(--spacing-2xl);
    }

    .cta-actions .btn-primary {
      background: white;
      color: var(--primary-600);
    }

    .cta-actions .btn-primary:hover {
      background: var(--gray-100);
      transform: translateY(-2px);
    }

    .footer {
      padding: var(--spacing-xl) 0;
      background: var(--gray-900);
      color: var(--gray-400);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 2.5rem;
      }

      .hero-actions {
        justify-content: center;
      }

      .features-grid, .farmers-grid {
        grid-template-columns: 1fr;
      }

      .container {
        padding: 0 var(--spacing-md);
      }
    }

    @media (max-width: 480px) {
      .hero-title {
        font-size: 2rem;
      }

      .hero-actions {
        flex-direction: column;
        align-items: center;
      }

      .hero-actions .btn {
        width: 100%;
        max-width: 280px;
      }
    }
  `]
})
export class LandingComponent implements OnInit {
  farmers: Farmer[] = [];
  loading = true;

  constructor(private router: Router, private farmerService: FarmerService) {}

  ngOnInit() {
    this.loadFarmers();
  }

  loadFarmers() {
    this.farmerService.getAllFarmersPublic().subscribe({
      next: (data) => {
        this.farmers = data.filter(f => f.isFarmerIdActive);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  scrollToFeatures() {
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
