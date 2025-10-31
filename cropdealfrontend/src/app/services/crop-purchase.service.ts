import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CropPurchase } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class CropPurchaseService {
  constructor() {}

  getDealerPurchases(dealerId: number): Observable<CropPurchase[]> {
    // TODO: Replace with actual HTTP call
    return of([]);
  }

  submitReview(purchaseId: number, review: { rating: number; reviewText: string }): Observable<any> {
    // TODO: Replace with actual HTTP call
    return of({ success: true });
  }
}
