import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Farmer } from './farmer.service';
import { Dealer } from './dealer.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:5209/api';

  constructor(private http: HttpClient) {}

  getFarmerById(id: number): Observable<Farmer> {
    return this.http.get<Farmer>(`${this.apiUrl}/Farmer/farmers-by-id-admin/${id}`);
  }

  getDealerById(id: number): Observable<Dealer> {
    return this.http.get<Dealer>(`${this.apiUrl}/Dealer/dealers-by-id-admin/${id}`);
  }

  updateFarmer(id: number, farmer: Farmer): Observable<any> {
    return this.http.put(`${this.apiUrl}/Farmer/farmers-details-update-admin/${id}`, farmer);
  }

  updateDealer(id: number, dealer: Dealer): Observable<any> {
    return this.http.put(`${this.apiUrl}/Dealer/dealers-details-update-admin/${id}`, dealer);
  }

  toggleFarmerVerification(farmerId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/Farmer/verify-farmer-admin/${farmerId}`, {});
  }
}
