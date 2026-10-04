import { DatePipe, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, inject, input, PLATFORM_ID, signal, viewChild } from '@angular/core';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';

import { TransactionPublic, TransactionType } from '../../../../core/transactions/models/transaction.model';
import { TransactionsService } from '../../../../core/transactions/services/transactions.service';

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  [TransactionType.Deposit]: 'Deposit',
  [TransactionType.Withdraw]: 'Withdraw',
  [TransactionType.Refund]: 'Refund',
  [TransactionType.CampaignDeposit]: 'Campaign Deposit',
  [TransactionType.CampaignWithdraw]: 'Campaign Withdraw',
};

type UserTransactionTableRow = {
  id: string;
  amount: number;
  type: string;
  description: string;
  status: string;
  created_at: string | null;
};

@Component({
  selector: 'admin-app-user-detail-transactions',
  imports: [DatePipe, DecimalPipe, TableModule, IconField, InputIcon, InputText],
  templateUrl: './user-detail-transactions.html',
  styleUrl: './user-detail-transactions.scss',
})
export class UserDetailTransactions {
  private readonly transactionsService = inject(TransactionsService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly transactionsTable = viewChild<Table>('transactionsTable');

  readonly userId = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly transactions = signal<UserTransactionTableRow[]>([]);

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

      this.loadTransactions(userId);
    });
  }

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.transactionsTable()?.filterGlobal(value, 'contains');
  }

  private loadTransactions(userId: string): void {
    this.loading.set(true);

    this.transactionsService.getByUserId(userId).subscribe({
      next: (page) => {
        if (page.count <= page.data.length) {
          this.transactions.set(page.data.map((transaction) => this.toRow(transaction)));
          this.loading.set(false);
          return;
        }

        this.transactionsService.getByUserId(userId, 0, page.count).subscribe({
          next: (fullPage) => {
            this.transactions.set(fullPage.data.map((transaction) => this.toRow(transaction)));
            this.loading.set(false);
          },
          error: () => {
            this.transactions.set(page.data.map((transaction) => this.toRow(transaction)));
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.transactions.set([]);
        this.loading.set(false);
      },
    });
  }

  private toRow(transaction: TransactionPublic): UserTransactionTableRow {
    const amount = Number(transaction.amount);

    return {
      id: transaction.id,
      amount: Number.isFinite(amount) ? amount : 0,
      type: TRANSACTION_TYPE_LABELS[transaction.transaction_type] ?? transaction.transaction_type,
      description: transaction.description?.trim() || '-',
      status: transaction.status,
      created_at: transaction.created_at,
    };
  }
}
