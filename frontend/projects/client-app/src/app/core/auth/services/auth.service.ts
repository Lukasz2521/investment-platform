import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { UserPublic, UserRegisterPayload } from '../models/user-register.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  register(payload: UserRegisterPayload): Observable<UserPublic> {
    return this.http.post<UserPublic>(`${environment.apiUrl}/users/signup`, payload);
  }
}
