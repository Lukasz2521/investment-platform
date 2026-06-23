import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { Card } from 'primeng/card';
import { Toolbar } from 'primeng/toolbar';

import { AppRoutingService } from '../../core/routing/app-routing.service';
import { TransactionPublic } from '../../core/transactions/models/transaction.model';
import { TransactionsService } from '../../core/transactions/services/transactions.service';
import {
  mapTransactionsWithUserEmail,
  TransactionTableRow,
} from '../../core/transactions/utils/transaction-display.utils';
import { UserPublic } from '../../core/users/models/user.model';
import { UsersService } from '../../core/users/services/users.service';
import { TransactionsTable } from '../transactions/transactions-table/transactions-table';
import { UsersTable } from '../users/users-table/users-table';

@Component({
  selector: 'admin-app-dashboard',
  imports: [Toolbar, Card, UsersTable, TransactionsTable],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly usersService = inject(UsersService);
  private readonly transactionsService = inject(TransactionsService);
  private readonly appRouting = inject(AppRoutingService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly loading = signal(true);
  protected readonly transactionsLoading = signal(true);
  protected readonly users = signal<UserPublic[]>([]);
  protected readonly transactions = signal<TransactionTableRow[]>([]);

  private loadedTransactions: TransactionPublic[] | null = null;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        this.loading.set(false);
        this.transactionsLoading.set(false);
        return;
      }

      this.loadUsers();
      this.loadTransactions();
    });
  }

  private loadUsers(): void {
    this.usersService.getAll().subscribe({
      next: ({ data }) => {
        this.users.set(data);
        this.loading.set(false);
        this.syncTransactions();
      },
      error: () => this.loading.set(false),
    });
  }

  private loadTransactions(): void {
    this.transactionsService.getAll().subscribe({
      next: ({ data }) => {
        this.loadedTransactions = data;
        this.transactionsLoading.set(false);
        this.syncTransactions();
      },
      error: () => this.transactionsLoading.set(false),
    });
  }

  private syncTransactions(): void {
    if (!this.loadedTransactions) {
      return;
    }

    this.transactions.set(mapTransactionsWithUserEmail(this.loadedTransactions, this.users()));
  }

  protected viewUser(userId: string): void {
    this.appRouting.navigateToUser(userId);
  }
}
