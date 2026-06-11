import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input, viewChild } from '@angular/core';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';

import {
  CampaignTableRow,
  formatCpmRange,
} from '../../../core/campaigns/utils/campaign-display.utils';

@Component({
  selector: 'admin-app-campaigns-table',
  imports: [DatePipe, DecimalPipe, TableModule, IconField, InputIcon, InputText, Button],
  templateUrl: './campaigns-table.html',
})
export class CampaignsTable {
  private readonly campaignsTable = viewChild<Table>('campaignsTable');

  readonly campaigns = input.required<CampaignTableRow[]>();
  readonly loading = input(false);

  protected readonly formatCpmRange = formatCpmRange;

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.campaignsTable()?.filterGlobal(value, 'contains');
  }
}
