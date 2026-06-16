import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { UsersPublic, UserPublic, AccountBankPublic } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<UsersPublic> {
    return this.http.get<UsersPublic>(`${environment.apiUrl}/users/all`);
  }

  getCurrentUser(): Observable<UserPublic> {
    return this.http.get<UserPublic>(`${environment.apiUrl}/users/me`);
  }

  getById(userId: string): Observable<UserPublic> {
    return this.http.get<UserPublic>(`${environment.apiUrl}/users/${userId}`);
  }

  setAccountBankEnabled(
    userId: string,
    bankId: string,
    isEnabled: boolean,
  ): Observable<AccountBankPublic> {
    return this.http.patch<AccountBankPublic>(
      `${environment.apiUrl}/users/${userId}/account/banks/${bankId}`,
      { is_enabled: isEnabled },
    );
  }
}
