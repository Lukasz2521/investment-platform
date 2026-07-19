import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { TransactionsPublic } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private readonly http = inject(HttpClient);

  getMine(skip = 0, limit = 20): Observable<TransactionsPublic> {
    const params = new HttpParams().set('skip', skip).set('limit', limit);

    return this.http.get<TransactionsPublic>(`${environment.apiUrl}/transactions/me`, {
      params,
    });
  }
}
