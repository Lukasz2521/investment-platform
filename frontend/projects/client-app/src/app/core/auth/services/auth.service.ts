import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { APP_ROUTE_PATHS } from '../../routing/app-route-paths';
import { TokenResponse } from '../models/token-response.model';
import { UserPublic } from '../models/user-public.model';
import { UserRegisterPayload } from '../models/user-register.model';
import { isTokenExpired } from '../utils/auth.utils';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenKey = 'client_access_token';

  register(payload: UserRegisterPayload): Observable<UserPublic> {
    return this.http.post<UserPublic>(`${environment.apiUrl}/users/signup`, payload);
  }

  login(email: string, password: string): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${environment.apiUrl}/users/login`, { email, password })
      .pipe(tap((response) => this.storeToken(response.access_token)));
  }

  getMe(): Observable<UserPublic> {
    return this.http.get<UserPublic>(`${environment.apiUrl}/users/me`);
  }

  updatePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${environment.apiUrl}/users/me/password`, {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  getToken(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    if (this.isTokenExpired(token)) {
      this.logout();
      return false;
    }

    return true;
  }

  isTokenExpired(token: string | null = this.getToken()): boolean {
    if (!token) {
      return true;
    }

    return isTokenExpired(token);
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
    }
  }

  forceLogout(): void {
    this.logout();
    void this.router.navigate(['/', APP_ROUTE_PATHS.login]);
  }

  private storeToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }
}
