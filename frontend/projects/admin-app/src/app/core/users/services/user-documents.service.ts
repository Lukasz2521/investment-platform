import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { AdminUserDocumentsPublic } from '../models/user-document.model';

@Injectable({ providedIn: 'root' })
export class UserDocumentsService {
  private readonly http = inject(HttpClient);

  getByUserId(userId: string): Observable<AdminUserDocumentsPublic> {
    return this.http.get<AdminUserDocumentsPublic>(`${environment.apiUrl}/users/${userId}/documents`);
  }

  getFile(userId: string, documentType: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/users/${userId}/documents/${documentType}/file`, {
      responseType: 'blob',
    });
  }
}
