import { DatePipe, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, inject, input, PLATFORM_ID, signal, viewChild } from '@angular/core';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';

import { TransactionPublic, TransactionType } from '../../../../core/transactions/models/transaction.model';
import { TransactionsService } from '../../../../core/transactions/services/transactions.service';

type UserWithdrawTableRow = {
  id: string;
  amount: number;
  status: string;
  transfer: string;
  holder: string;
  purpose: string;
  iban: string;
  bank: string;
  description: string;
  created_at: string | null;
};

@Component({
  selector: 'admin-app-user-detail-withdraws',
  imports: [DatePipe, DecimalPipe, TableModule, IconField, InputIcon, InputText],
  templateUrl: './user-detail-withdraws.html',
  styleUrl: './user-detail-withdraws.scss',
})
export class UserDetailWithdraws {
  private readonly transactionsService = inject(TransactionsService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly withdrawsTable = viewChild<Table>('withdrawsTable');

  readonly userId = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly withdraws = signal<UserWithdrawTableRow[]>([]);

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

      this.loadWithdraws(userId);
    });
  }

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.withdrawsTable()?.filterGlobal(value, 'contains');
  }

  private loadWithdraws(userId: string): void {
    this.loading.set(true);

    this.transactionsService.getByUserId(userId, 0, 100, TransactionType.Withdraw).subscribe({
      next: (page) => {
        if (page.count <= page.data.length) {
          this.withdraws.set(page.data.map((transaction) => this.toRow(transaction)));
          this.loading.set(false);
          return;
        }

        this.transactionsService.getByUserId(userId, 0, page.count, TransactionType.Withdraw).subscribe({
          next: (fullPage) => {
            this.withdraws.set(fullPage.data.map((transaction) => this.toRow(transaction)));
            this.loading.set(false);
          },
          error: () => {
            this.withdraws.set(page.data.map((transaction) => this.toRow(transaction)));
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.withdraws.set([]);
        this.loading.set(false);
      },
    });
  }

  private toRow(transaction: TransactionPublic): UserWithdrawTableRow {
    const details = parseWithdrawDescription(transaction.description);
    const amount = Number(transaction.amount);

    return {
      id: transaction.id,
      amount: Number.isFinite(amount) ? amount : 0,
      status: transaction.status,
      transfer: details.transfer,
      holder: details.holder,
      purpose: details.purpose,
      iban: details.iban,
      bank: details.bank,
      description: transaction.description?.trim() || '-',
      created_at: transaction.created_at,
    };
  }
}

function parseWithdrawDescription(description: string | null): {
  transfer: string;
  holder: string;
  purpose: string;
  iban: string;
  bank: string;
} {
  const fallback = {
    transfer: '-',
    holder: '-',
    purpose: '-',
    iban: '-',
    bank: '-',
  };
  if (!description?.trim()) {
    return fallback;
  }

  const parts = description.split(' | ');
  const transferMatch = /^Withdraw \((.+)\)$/.exec(parts[0] ?? '');
  if (!transferMatch || parts.length < 5) {
    return fallback;
  }

  return {
    transfer: transferMatch[1],
    holder: readLabeledPart(parts[1], 'Holder'),
    purpose: readLabeledPart(parts[2], 'Purpose'),
    iban: readLabeledPart(parts[3], 'IBAN'),
    bank: readLabeledPart(parts.slice(4).join(' | '), 'Bank'),
  };
}

function readLabeledPart(value: string | undefined, label: string): string {
  const prefix = `${label}: `;
  if (!value?.startsWith(prefix)) {
    return '-';
  }

  const content = value.slice(prefix.length).trim();
  return content || '-';
}
