import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';

import { TransactionPublic } from '../../../core/transactions/models/transaction.model';

export type DashboardTransaction = TransactionPublic & {
  user_email: string;
};

@Component({
  selector: 'admin-app-dashboard-transactions-table',
  imports: [DatePipe, DecimalPipe, TableModule, Button],
  templateUrl: './dashboard-transactions-table.html',
})
export class DashboardTransactionsTable {
  readonly transactions = input.required<DashboardTransaction[]>();
  readonly loading = input(false);

  protected displayValue(value: string | null | undefined): string {
    return value?.trim() ? value : '-';
  }
}
