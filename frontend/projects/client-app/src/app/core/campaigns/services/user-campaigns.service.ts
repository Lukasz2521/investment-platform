import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  UserCampaignCreate,
  UserCampaignPublic,
  UserCampaignsPublic,
} from '../models/user-campaign.model';

@Injectable({ providedIn: 'root' })
export class UserCampaignsService {
  private readonly http = inject(HttpClient);

  start(payload: UserCampaignCreate): Observable<UserCampaignPublic> {
    return this.http.post<UserCampaignPublic>(`${environment.apiUrl}/user-campaigns/`, payload);
  }

  getAll(skip = 0, limit = 100): Observable<UserCampaignsPublic> {
    const params = new HttpParams().set('skip', skip).set('limit', limit);

    return this.http.get<UserCampaignsPublic>(`${environment.apiUrl}/user-campaigns/`, { params });
  }

  getById(userCampaignId: string): Observable<UserCampaignPublic> {
    return this.http.get<UserCampaignPublic>(
      `${environment.apiUrl}/user-campaigns/${userCampaignId}`,
    );
  }
}
