import { DatePipe, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, inject, input, PLATFORM_ID, signal, viewChild } from '@angular/core';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';

import { UserCampaignPublic, UserCampaignStatus } from '../../../../core/campaigns/models/user-campaign.model';
import { UserCampaignsService } from '../../../../core/campaigns/services/user-campaigns.service';

type UserCampaignTableRow = {
  id: string;
  title: string;
  status: UserCampaignStatus;
  start_date: string;
  end_date: string;
  budget: number;
  currency: string;
  cpm: number;
  epc: number;
  ctr: number;
  participation: number;
  impressions: number;
  clicks: number;
  gross_revenue: number;
  gross_profit: number;
  net_profit: number;
  created_at: string | null;
};

@Component({
  selector: 'admin-app-user-detail-campaigns',
  imports: [DatePipe, DecimalPipe, TableModule, IconField, InputIcon, InputText],
  templateUrl: './user-detail-campaigns.html',
  styleUrl: './user-detail-campaigns.scss',
})
export class UserDetailCampaigns {
  private readonly userCampaignsService = inject(UserCampaignsService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly campaignsTable = viewChild<Table>('campaignsTable');

  readonly userId = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly campaigns = signal<UserCampaignTableRow[]>([]);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        this.loading.set(false);
        return;
      }

      const userId = this.userId();
      if (!userId) {
        this.loading.set(false);
        return;
      }

      this.loadCampaigns(userId);
    });
  }

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.campaignsTable()?.filterGlobal(value, 'contains');
  }

  private loadCampaigns(userId: string): void {
    this.loading.set(true);

    this.userCampaignsService.getByUserId(userId, 0, 100).subscribe({
      next: (page) => {
        if (page.count <= page.data.length) {
          this.campaigns.set(page.data.map((campaign) => this.toRow(campaign)));
          this.loading.set(false);
          return;
        }

        this.userCampaignsService.getByUserId(userId, 0, page.count).subscribe({
          next: (fullPage) => {
            this.campaigns.set(fullPage.data.map((campaign) => this.toRow(campaign)));
            this.loading.set(false);
          },
          error: () => {
            this.campaigns.set(page.data.map((campaign) => this.toRow(campaign)));
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.campaigns.set([]);
        this.loading.set(false);
      },
    });
  }

  private toRow(campaign: UserCampaignPublic): UserCampaignTableRow {
    return {
      id: campaign.id,
      title: campaign.campaign.title,
      status: campaign.status,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      budget: this.toNumber(campaign.budget),
      currency: campaign.campaign.currency,
      cpm: this.toNumber(campaign.cpm),
      epc: this.toNumber(campaign.epc),
      ctr: this.toNumber(campaign.ctr),
      participation: campaign.participation,
      impressions: campaign.impressions,
      clicks: campaign.clicks,
      gross_revenue: this.toNumber(campaign.gross_revenue),
      gross_profit: this.toNumber(campaign.gross_profit),
      net_profit: this.toNumber(campaign.net_profit),
      created_at: campaign.created_at,
    };
  }

  private toNumber(value: string): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
}
