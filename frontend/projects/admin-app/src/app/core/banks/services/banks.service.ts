import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { BankCreate, BankPublic, BanksPublic, BankUpdate } from '../models/bank.model';

@Injectable({ providedIn: 'root' })
export class BanksService {
  private readonly http = inject(HttpClient);

  getAll(skip = 0, limit = 100): Observable<BanksPublic> {
    const params = new HttpParams().set('skip', skip).set('limit', limit);

    return this.http.get<BanksPublic>(`${environment.apiUrl}/banks/`, { params });
  }

  create(bank: BankCreate): Observable<BankPublic> {
    return this.http.post<BankPublic>(`${environment.apiUrl}/banks/`, bank);
  }

  update(bankId: string, bank: BankUpdate): Observable<BankPublic> {
    return this.http.put<BankPublic>(`${environment.apiUrl}/banks/${bankId}`, bank);
  }

  delete(bankId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/banks/${bankId}`);
  }
}
