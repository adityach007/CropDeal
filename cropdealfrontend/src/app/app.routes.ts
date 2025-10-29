import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { FarmerDashboardComponent } from './components/farmer-dashboard/farmer-dashboard.component';
import { DealerDashboardComponent } from './components/dealer-dashboard/dealer-dashboard.component';
import { ManageCropsComponent } from './components/manage-crops/manage-crops.component';
import { LandingComponent } from './components/landing/landing.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { 
    path: 'farmer',
    children: [
      { path: 'dashboard', component: FarmerDashboardComponent },
      { path: 'manage-crops', component: ManageCropsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'dealer',
    children: [
      { path: 'dashboard', component: DealerDashboardComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
