import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Farmer {
  farmerId: number;
  farmerName: string;
  emailAddressFarmer: string;
  farmerPhoneNumber: string;
  farmerAadharNumber: string;
  farmerBankAccount: string;
  farmerIFSCCode: string;
  farmerLocation: string;
  isFarmerIdActive: boolean;
  subscriberCount: number;
}

export interface Crop {
  cropId: number;
  cropType: string;
  cropName: string;
  quantityInKg: number;
  location: string;
  farmerId: number;
  pricePerUnit: number;
}

export interface CropPurchase {
  purchaseId: number;
  dealerId: number;
  cropId: number;
  quantityRequested: number;
  requestedAt: Date;
  isConfirmed: boolean;
  rating?: number;
  reviewText?: string;
  reviewDate?: Date;
  hasBeenReviewed: boolean;
  crop?: Crop;
}

@Injectable({
  providedIn: 'root'
})
export class FarmerService {
  private apiUrl = 'http://localhost:5209/api';

  constructor(private http: HttpClient) {}

  getFarmerProfile(): Observable<Farmer> {
    return this.http.get<Farmer>(`${this.apiUrl}/Farmer/current-farmer-details/profile`);
  }

  getFarmerCrops(farmerId: number): Observable<Crop[]> {
    return this.http.get<Crop[]>(`${this.apiUrl}/Crops/current-farmer-crops`);
  }

  getCropPurchases(farmerId: number): Observable<CropPurchase[]> {
    return this.http.get<CropPurchase[]>(`${this.apiUrl}/CropPurchase/by-farmer/${farmerId}`);
  }

  getSubscriberCount(farmerId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/Farmer/get-subscriber-count/${farmerId}`);
  }
}