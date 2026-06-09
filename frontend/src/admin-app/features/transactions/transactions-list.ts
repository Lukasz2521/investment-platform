import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Toolbar } from 'primeng/toolbar';

import { TransactionPublic } from '../../core/transactions/models/transaction.model';
import { TransactionsService } from '../../core/transactions/services/transactions.service';
import {
  mapTransactionsWithUserEmail,
  TransactionTableRow,
} from '../../core/transactions/utils/transaction-display.utils';
import { UserPublic } from '../../core/users/models/user.model';
import { UsersService } from '../../core/users/services/users.service';
import { TransactionsTable } from './transactions-table/transactions-table';

@Component({
  selector: 'admin-app-transactions-list',
  imports: [Toolbar, Card, Button, TransactionsTable],
  templateUrl: './transactions-list.html',
  styleUrl: './transactions-list.scss',
})
export class TransactionsList {
  private readonly transactionsService = inject(TransactionsService);
  private readonly usersService = inject(UsersService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly loading = signal(true);
  protected readonly transactions = signal<TransactionTableRow[]>([]);

  private loadedTransactions: TransactionPublic[] | null = null;
  private loadedUsers: UserPublic[] | null = null;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        this.loading.set(false);
        return;
      }

      this.loadUsers();
      this.loadTransactions();
    });
  }

  private loadUsers(): void {
    this.usersService.getAll().subscribe({
      next: ({ data }) => {
        this.loadedUsers = data;
        this.syncTransactions();
      },
      error: () => this.loading.set(false),
    });
  }

  private loadTransactions(): void {
    this.transactionsService.getAll().subscribe({
      next: ({ data }) => {
        this.loadedTransactions = data;
        this.syncTransactions();
      },
      error: () => this.loading.set(false),
    });
  }

  private syncTransactions(): void {
    if (!this.loadedTransactions || !this.loadedUsers) {
      return;
    }

    this.transactions.set(
      mapTransactionsWithUserEmail(this.loadedTransactions, this.loadedUsers),
    );
    this.loading.set(false);
  }
}
