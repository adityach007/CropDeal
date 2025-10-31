import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'CropDeal';
  showNavigation = false;
  isLoggedIn = false;
  userType: number | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Check initial auth state
    this.updateAuthState();

    // Listen to route changes to show/hide navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateNavigation(event.url);
      this.updateAuthState();
    });
  }

  private updateNavigation(url: string) {
    // Hide navigation on landing and login pages
    const hideNavRoutes = ['/', '/login', '/register'];
    this.showNavigation = !hideNavRoutes.includes(url);
  }

  private updateAuthState() {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      const user = this.authService.getCurrentUser();
      this.userType = user?.userType || null;
    } else {
      this.userType = null;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
