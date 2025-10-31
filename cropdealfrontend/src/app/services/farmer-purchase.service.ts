import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Purchase } from './purchases.service';

@Injectable({ providedIn: 'root' })
export class FarmerPurchaseService {
  private apiUrl = 'http://localhost:5209/api/croppurchase';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getMyPurchaseRequests(farmerId: number): Observable<Purchase[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Purchase[]>(`${this.apiUrl}/by-farmer/${farmerId}`, { headers });
  }

  confirmPurchase(purchaseId: number): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/crop-purchase-by-dealer/${purchaseId}/confirm`, {}, { headers });
  }
}