import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { UserPublicWithAccount } from '../models/user-account.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);

  getById(userId: string): Observable<UserPublicWithAccount> {
    return this.http.get<UserPublicWithAccount>(`${environment.apiUrl}/users/${userId}`);
  }
}
