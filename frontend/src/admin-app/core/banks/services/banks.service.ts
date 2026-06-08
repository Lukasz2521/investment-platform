import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { BanksPublic } from '../models/bank.model';

@Injectable({ providedIn: 'root' })
export class BanksService {
  private readonly http = inject(HttpClient);

  getAll(skip = 0, limit = 100): Observable<BanksPublic> {
    const params = new HttpParams().set('skip', skip).set('limit', limit);

    return this.http.get<BanksPublic>(`${environment.apiUrl}/banks/`, { params });
  }
}
