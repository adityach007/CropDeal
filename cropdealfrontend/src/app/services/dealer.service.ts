import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Dealer {
  dealerId: number;
  dealerName: string;
  dealerEmailAddress: string;
  dealerPhoneNumber: string;
  dealerAadharNumber: string;
  dealerBankAccount: string;
  dealerIFSCode: string;
  dealerLocation: string;
  isDealerIdActive: boolean;
}

export interface CropPurchase {
  purchaseId: number;
  cropId: number;
  dealerId: number;
  quantityRequested: number;
  requestedAt: Date;
  isConfirmed: boolean;
  rating?: number;
  reviewText?: string;
  reviewDate?: Date;
  hasBeenReviewed: boolean;
  crop?: {
    cropId: number;
    cropName: string;
    cropType: string;
    quantityInKg: number;
    pricePerUnit: number;
    location: string;
  };
}

export interface FarmerSubscription {
  farmerId: number;
  farmerName: string;
  location: string;
  subscribedDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DealerService {
  private apiUrl = 'http://localhost:5209/api';

  constructor(private http: HttpClient) {}

  getDealerProfile(): Observable<Dealer> {
    return this.http.get<Dealer>(`${this.apiUrl}/Dealer/current-dealer-details/profile`);
  }

  getDealerPurchases(dealerId: number): Observable<CropPurchase[]> {
    return this.http.get<CropPurchase[]>(`${this.apiUrl}/CropPurchase/by-dealer/${dealerId}`);
  }

  getSubscribedFarmers(): Observable<FarmerSubscription[]> {
    return this.http.get<FarmerSubscription[]>(`${this.apiUrl}/Dealer/subscriptions`);
  }

  subscribeToFarmer(farmerId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/Dealer/subscribe`, { farmerId });
  }

  unsubscribeFromFarmer(farmerId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/Dealer/unsubscribe/${farmerId}`, {});
  }

  checkSubscriptionStatus(farmerId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/Dealer/check-subscription/${farmerId}`);
  }

  submitPurchaseReview(purchaseId: number, rating: number, reviewText: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/CropPurchase/crop-purchased-submit/${purchaseId}/review`, {
      rating,
      reviewText
    });
  }

  private getDealerId(): string {
    const user = localStorage.getItem('auth');
    if (user) {
      const userData = JSON.parse(user);
      return userData.dealerId;
    }
    return '';
  }
}
