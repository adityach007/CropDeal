import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Crop {
  cropId: number;
  cropType: string;
  cropName: string;
  quantityInKg: number;
  location: string;
  farmerId: number;
  pricePerUnit: number;
}

export interface UpdateCropDto {
  cropId: number;
  cropName: string;
  cropType: string;
  quantityInKg: number;
  pricePerUnit: number;
  location: string;
}

@Injectable({
  providedIn: 'root'
})
export class CropsService {
  private apiUrl = 'http://localhost:5209/api/Crops';

  constructor(private http: HttpClient) {}

  createCrop(crop: Crop): Observable<any> {
    return this.http.post(`${this.apiUrl}/crops-details-farmer`, crop);
  }

  updateCrop(cropId: number, crop: UpdateCropDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/crop-details-update-by-id/${cropId}`, crop);
  }

  deleteCrop(cropId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/crops-delete-by-id/${cropId}`);
  }

  getMyCrops(): Observable<Crop[]> {
    return this.http.get<Crop[]>(`${this.apiUrl}/current-farmer-crops`);
  }

  getCropById(cropId: number): Observable<Crop> {
    return this.http.get<Crop>(`${this.apiUrl}/all-crops-by-id/${cropId}`);
  }
}
