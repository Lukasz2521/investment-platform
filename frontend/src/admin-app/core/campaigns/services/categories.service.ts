import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { CategoryCreate, CategoryPublic, CategoryUpdate } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<CategoryPublic[]> {
    return this.http.get<CategoryPublic[]>(`${environment.apiUrl}/campaigns/categories/`);
  }

  create(category: CategoryCreate): Observable<CategoryPublic> {
    return this.http.post<CategoryPublic>(`${environment.apiUrl}/campaigns/categories/`, category);
  }

  update(categoryId: string, category: CategoryUpdate): Observable<CategoryPublic> {
    return this.http.put<CategoryPublic>(
      `${environment.apiUrl}/campaigns/categories/${categoryId}`,
      category,
    );
  }

  delete(categoryId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${environment.apiUrl}/campaigns/categories/${categoryId}`,
    );
  }
}
