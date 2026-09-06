import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { CampaignCreate, CampaignPublic, CampaignsPublic, CampaignUpdate } from '../models/campaign.model';

@Injectable({ providedIn: 'root' })
export class CampaignsService {
  private readonly http = inject(HttpClient);

  getAll(skip = 0, limit = 100): Observable<CampaignsPublic> {
    const params = new HttpParams().set('skip', skip).set('limit', limit);

    return this.http.get<CampaignsPublic>(`${environment.apiUrl}/campaigns/`, { params });
  }

  create(campaign: CampaignCreate): Observable<CampaignPublic> {
    return this.http.post<CampaignPublic>(`${environment.apiUrl}/campaigns/`, campaign);
  }

  update(campaignId: string, campaign: CampaignUpdate): Observable<CampaignPublic> {
    return this.http.put<CampaignPublic>(`${environment.apiUrl}/campaigns/${campaignId}`, campaign);
  }

  delete(campaignId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/campaigns/${campaignId}`);
  }
}
