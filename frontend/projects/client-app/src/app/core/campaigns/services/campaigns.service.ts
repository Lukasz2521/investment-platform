import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { CampaignPublic, CampaignsPublic } from '../models/campaign.model';

@Injectable({ providedIn: 'root' })
export class CampaignsService {
  private readonly http = inject(HttpClient);

  getAll(skip = 0, limit = 100): Observable<CampaignsPublic> {
    const params = new HttpParams().set('skip', skip).set('limit', limit);

    return this.http.get<CampaignsPublic>(`${environment.apiUrl}/campaigns/`, { params });
  }

  getById(campaignId: string): Observable<CampaignPublic> {
    return this.http.get<CampaignPublic>(`${environment.apiUrl}/campaigns/${campaignId}`);
  }
}
