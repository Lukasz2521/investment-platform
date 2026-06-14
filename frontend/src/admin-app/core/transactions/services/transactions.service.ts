import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { CreateTransaction, TransactionPublic, TransactionsPublic } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private readonly http = inject(HttpClient);

  getAll(skip = 0, limit = 100): Observable<TransactionsPublic> {
    const params = new HttpParams().set('skip', skip).set('limit', limit);

    return this.http.get<TransactionsPublic>(`${environment.apiUrl}/transactions/`, { params });
  }

  getByUserId(userId: string, skip = 0, limit = 100): Observable<TransactionsPublic> {
    const params = new HttpParams().set('skip', skip).set('limit', limit);

    return this.http.get<TransactionsPublic>(`${environment.apiUrl}/transactions/user/${userId}`, { params });
  }

  create(transaction: CreateTransaction): Observable<TransactionPublic> {
    return this.http.post<TransactionPublic>(`${environment.apiUrl}/transactions/`, transaction);
  }

  delete(transactionId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${environment.apiUrl}/transactions/${transactionId}`,
    );
  }
}
