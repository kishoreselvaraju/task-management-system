import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http
      .post<{ access_token: string }>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem('access_token', res.access_token);
        })
      );
  }

  logout() {
    localStorage.removeItem('access_token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getRole(): string | null {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    const decoded = this.jwtHelper.decodeToken(token);
    return decoded?.role || null;
  }

  getEmail(): string | null {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    const decoded = this.jwtHelper.decodeToken(token);
    return decoded?.email || null;
  }
}
