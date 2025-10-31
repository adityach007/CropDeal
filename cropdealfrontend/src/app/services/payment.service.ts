import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:5209/api/Payment';

  constructor(private http: HttpClient) {}

  getPaymentsByCrop(cropId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/by-crop/${cropId}`);
  }

  getPaymentById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/${id}`);
  }

  getPaymentsByFarmer(farmerId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/by-farmer/${farmerId}`);
  }

  getPaymentsByDealer(dealerId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/by-dealer/${dealerId}`);
  }

  updatePaymentStatus(paymentId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${paymentId}/status`, { status });
  }

  createStripePayment(purchaseId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-stripe-payment`, { purchaseId });
  }
}
