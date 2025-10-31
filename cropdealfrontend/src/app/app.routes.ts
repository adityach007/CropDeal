import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { FarmerDashboardComponent } from './components/farmer-dashboard/farmer-dashboard.component';
import { DealerDashboardComponent } from './components/dealer-dashboard/dealer-dashboard.component';
import { ManageCropsComponent } from './components/manage-crops/manage-crops.component';
import { LandingComponent } from './components/landing/landing.component';
import { BrowseCropsComponent } from './components/browse-crops/browse-crops.component';
import { BrowseFarmersComponent } from './components/browse-farmers/browse-farmers.component';
import { PaymentComponent } from './components/payment/payment.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { FarmerProfileComponent } from './components/farmer-profile/farmer-profile.component';
import { DealerProfileComponent } from './components/dealer-profile/dealer-profile.component';
import { AdminEditUserComponent } from './components/admin-edit-user/admin-edit-user.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'farmer',
    children: [
      { path: 'dashboard', component: FarmerDashboardComponent },
      { path: 'manage-crops', component: ManageCropsComponent },
      { path: 'profile', component: FarmerProfileComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'dealer',
    children: [
      { path: 'dashboard', component: DealerDashboardComponent },
      { path: 'browse-crops', component: BrowseCropsComponent },
      { path: 'browse-farmers', component: BrowseFarmersComponent },
      { path: 'profile', component: DealerProfileComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: 'payment/:purchaseId', component: PaymentComponent },
  { path: 'admin-login', component: AdminLoginComponent },
  {
    path: 'admin',
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'edit-user/:type/:id', component: AdminEditUserComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
