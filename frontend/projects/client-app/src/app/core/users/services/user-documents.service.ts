import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

export type UserDocumentType =
  | 'id_front'
  | 'id_back'
  | 'address_proof'
  | 'iban'
  | 'funds_source';

export type UserDocumentPublic = {
  document_type: UserDocumentType | string;
  uploaded: boolean;
};

export type UserDocumentsPublic = {
  data: UserDocumentPublic[];
};

@Injectable({ providedIn: 'root' })
export class UserDocumentsService {
  private readonly http = inject(HttpClient);

  list(): Observable<UserDocumentsPublic> {
    return this.http.get<UserDocumentsPublic>(`${environment.apiUrl}/users/me/documents`);
  }

  upload(documentType: UserDocumentType, file: File): Observable<UserDocumentPublic> {
    const body = new FormData();
    body.append('file', file);

    return this.http.post<UserDocumentPublic>(
      `${environment.apiUrl}/users/me/documents/${documentType}`,
      body,
    );
  }

  remove(documentType: UserDocumentType): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${environment.apiUrl}/users/me/documents/${documentType}`,
    );
  }
}
