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

  create(bank: BankCreate, logo?: File | null): Observable<BankPublic> {
    return this.http.post<BankPublic>(`${environment.apiUrl}/banks/`, this.toFormData(bank, logo));
  }

  update(
    bankId: string,
    bank: BankUpdate,
    options?: { logo?: File | null; removeLogo?: boolean },
  ): Observable<BankPublic> {
    return this.http.put<BankPublic>(
      `${environment.apiUrl}/banks/${bankId}`,
      this.toFormData(bank, options?.logo, options?.removeLogo),
    );
  }

  delete(bankId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/banks/${bankId}`);
  }

  private toFormData(
    bank: BankCreate | BankUpdate,
    logo?: File | null,
    removeLogo = false,
  ): FormData {
    const formData = new FormData();

    for (const [key, value] of Object.entries(bank)) {
      if (key === 'bank_logo' || value === undefined || value === null) {
        continue;
      }
      formData.append(key, String(value));
    }

    if (removeLogo) {
      formData.append('remove_logo', 'true');
    }

    if (logo) {
      formData.append('logo', logo, logo.name);
    }

    return formData;
  }
}
