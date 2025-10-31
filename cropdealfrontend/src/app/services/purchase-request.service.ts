import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface PurchaseRequest {
  cropId: number;
  quantityRequested: number;
  dealerId?: number;
}

export interface ReviewRequest {
  rating: number;
  reviewText: string;
}

@Injectable({ providedIn: 'root' })
export class PurchaseRequestService {
  private apiUrl = 'http://localhost:5209/api/croppurchase';

  constructor(private http: HttpClient, private authService: AuthService) {}

  createPurchaseRequest(request: PurchaseRequest): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/crop-request-by-dealer/request`, request, { headers });
  }

  submitReview(purchaseId: number, review: ReviewRequest): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/crop-purchased-submit/${purchaseId}/review`, review, { headers });
  }
}