import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { NewsCreate, NewsListPublic, NewsPublic, NewsUpdate } from '../models/news.model';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly http = inject(HttpClient);

  getAll(skip = 0, limit = 100): Observable<NewsListPublic> {
    const params = new HttpParams().set('skip', skip).set('limit', limit);

    return this.http.get<NewsListPublic>(`${environment.apiUrl}/news/`, { params });
  }

  create(news: NewsCreate): Observable<NewsPublic> {
    return this.http.post<NewsPublic>(`${environment.apiUrl}/news/`, news);
  }

  update(newsId: string, news: NewsUpdate): Observable<NewsPublic> {
    return this.http.put<NewsPublic>(`${environment.apiUrl}/news/${newsId}`, news);
  }

  delete(newsId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/news/${newsId}`);
  }
}
