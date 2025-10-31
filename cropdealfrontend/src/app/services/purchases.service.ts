import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Purchase {
  purchaseId: number;
  dealerId: number;
  cropId: number;
  quantityRequested: number;
  requestedAt: string;
  isConfirmed: boolean;
  rating?: number;
  reviewText?: string;
  reviewDate?: string;
  hasBeenReviewed: boolean;
  crop?: {
    cropId: number;
    cropName: string;
    cropType: string;
    quantityInKg: number;
    pricePerUnit: number;
    location: string;
    farmerId: number;
    farmer?: {
      farmerId: number;
      farmerName: string;
      emailAddressFarmer: string;
      farmerPhoneNumber: string;
      farmerLocation: string;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class PurchasesService {
  private apiUrl = 'http://localhost:5209/api/croppurchase/by-dealer'; // Full backend URL

  constructor(private http: HttpClient, private authService: AuthService) {}

  getMyPurchases(dealerId: number): Observable<Purchase[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Purchase[]>(`${this.apiUrl}/${dealerId}`, { headers });
  }
}
