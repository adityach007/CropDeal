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

@Injectable({
  providedIn: 'root'
})
export class DealerService {
  private apiUrl = 'http://localhost:5209/api';

  constructor(private http: HttpClient) {}

  getDealerProfile(): Observable<Dealer> {
    return this.http.get<Dealer>(`${this.apiUrl}/Dealer/current-dealer-details/profile`);
  }

  subscribeToFarmer(farmerId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/Dealer/subscribe`, { farmerId });
  }

  unsubscribeFromFarmer(farmerId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/Dealer/unsubscribe/${farmerId}`, {});
  }

  getSubscribedFarmers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Dealer/subscriptions`);
  }

  checkSubscriptionStatus(farmerId: number): Observable<{isSubscribed: boolean}> {
    return this.http.get<{isSubscribed: boolean}>(`${this.apiUrl}/Dealer/check-subscription/${farmerId}`);
  }

  updateDealerProfile(dealer: Dealer): Observable<any> {
    return this.http.put(`${this.apiUrl}/Dealer/current-dealer-details-update/profile`, dealer);
  }
}
