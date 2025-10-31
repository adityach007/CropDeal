import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  userType: number;
  aadharNumber: string;
  bankAccount?: string;
  ifscCode?: string;
  location?: string;
  isActive: boolean;
}

export interface AuthResponse {
  userId: number;
  name: string;
  email: string;
  userType: number;
  token: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5209/api'; // Backend API URL
  private authSubject = new BehaviorSubject<AuthResponse | null>(null);
  public auth$ = this.authSubject.asObservable();

  constructor(private http: HttpClient) {
    // Safely load saved auth only in browser environments
    try {
      if (typeof window !== 'undefined' && window?.localStorage) {
        const savedAuth = localStorage.getItem('auth');
        if (savedAuth) {
          this.authSubject.next(JSON.parse(savedAuth));
        }
      }
    } catch (e) {
      // localStorage may not be available (SSR). Ignore safely.
      console.warn('localStorage not available; skipping saved auth load.', e);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Auth/login`, credentials)
      .pipe(
        tap((response: AuthResponse) => {
          this.authSubject.next(response);
          // Save to localStorage only if available
          try {
            if (typeof window !== 'undefined' && window?.localStorage) {
              localStorage.setItem('auth', JSON.stringify(response));
            }
          } catch (e) {
            console.warn('localStorage not available; skipping saving auth.', e);
          }
        })
      );
  }

  register(registerData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Auth/register`, registerData)
      .pipe(
        tap((response: AuthResponse) => {
          this.authSubject.next(response);
          // Save to localStorage only if available
          try {
            if (typeof window !== 'undefined' && window?.localStorage) {
              localStorage.setItem('auth', JSON.stringify(response));
            }
          } catch (e) {
            console.warn('localStorage not available; skipping saving auth.', e);
          }
        })
      );
  }

  logout(): void {
    try {
      if (typeof window !== 'undefined' && window?.localStorage) {
        localStorage.removeItem('auth');
      }
    } catch (e) {
      console.warn('localStorage not available during logout.', e);
    }
    this.authSubject.next(null);
  }

  isLoggedIn(): boolean {
    return this.authSubject.value !== null;
  }

  getCurrentUser(): AuthResponse | null {
    return this.authSubject.value;
  }

  getToken(): string | null {
    return this.authSubject.value?.token ?? null;
  }

  setAuth(response: AuthResponse): void {
    this.authSubject.next(response);
    try {
      if (typeof window !== 'undefined' && window?.localStorage) {
        localStorage.setItem('auth', JSON.stringify(response));
      }
    } catch (e) {
      console.warn('localStorage not available; skipping saving auth.', e);
    }
  }
}
