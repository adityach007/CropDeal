import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Crop {
  cropId: number;
  cropName: string;
  cropType: string;
  quantityInKg: number;
  pricePerUnit: number;
  location: string;
  farmerId: number;
}

@Injectable({ providedIn: 'root' })
export class CropsService {
  private apiUrl = 'http://localhost:5209/api/crops';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getAllCrops(): Observable<Crop[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Crop[]>(`${this.apiUrl}/all-crops`, { headers });
  }

  getMyCrops(): Observable<Crop[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Crop[]>(`${this.apiUrl}/current-farmer-crops`, { headers });
  }

  createCrop(crop: Omit<Crop, 'cropId'>): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/crops-details-farmer`, crop, { headers });
  }

  updateCrop(id: number, crop: Partial<Crop>): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.put(`${this.apiUrl}/crop-details-update-by-id/${id}`, { ...crop, cropId: id }, { headers });
  }

  deleteCrop(id: number): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete(`${this.apiUrl}/crops-delete-by-id/${id}`, { headers });
  }
}