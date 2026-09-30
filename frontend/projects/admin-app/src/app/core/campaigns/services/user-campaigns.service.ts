import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { UserCampaignsPublic } from '../models/user-campaign.model';

@Injectable({ providedIn: 'root' })
export class UserCampaignsService {
  private readonly http = inject(HttpClient);

  getByUserId(userId: string, skip = 0, limit = 100): Observable<UserCampaignsPublic> {
    const params = new HttpParams().set('skip', skip).set('limit', limit);

    return this.http.get<UserCampaignsPublic>(
      `${environment.apiUrl}/user-campaigns/user/${userId}`,
      { params },
    );
  }
}
