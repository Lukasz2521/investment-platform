import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { NewsListPublic } from '../models/news.model';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly http = inject(HttpClient);

  getAll(skip = 0, limit = 100): Observable<NewsListPublic> {
    const params = new HttpParams().set('skip', skip).set('limit', limit);

    return this.http.get<NewsListPublic>(`${environment.apiUrl}/news/`, { params });
  }
}
