import { DatePipe, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, inject, PLATFORM_ID, signal, viewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { Toolbar } from 'primeng/toolbar';

import { TransactionPublic } from '../../core/transactions/models/transaction.model';
import { TransactionsService } from '../../core/transactions/services/transactions.service';
import { UserPublic } from '../../core/users/models/user.model';
import { UsersService } from '../../core/users/services/users.service';

type DashboardTransaction = TransactionPublic & {
  user_email: string;
};

@Component({
  selector: 'admin-app-dashboard',
  imports: [
    DatePipe,
    DecimalPipe,
    TableModule,
    Toolbar,
    Card,
    IconField,
    InputIcon,
    InputText,
    Button,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly usersService = inject(UsersService);
  private readonly transactionsService = inject(TransactionsService);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly usersTable = viewChild<Table>('usersTable');
  private readonly transactionsTable = viewChild<Table>('transactionsTable');

  protected readonly loading = signal(true);
  protected readonly transactionsLoading = signal(true);
  protected readonly users = signal<UserPublic[]>([]);
  protected readonly transactions = signal<DashboardTransaction[]>([]);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        this.loading.set(false);
        this.transactionsLoading.set(false);
        return;
      }

      this.loadDashboardData();
    });
  }

  private loadDashboardData(): void {
    forkJoin({
      users: this.usersService.getAll(),
      transactions: this.transactionsService.getAll(),
    }).subscribe({
      next: ({ users, transactions }) => {
        const emailById = Object.fromEntries(users.data.map((user) => [user.id, user.email]));

        this.users.set(users.data);
        this.transactions.set(
          transactions.data.map((transaction) => ({
            ...transaction,
            user_email: emailById[transaction.user_id] ?? '-',
          })),
        );
        this.loading.set(false);
        this.transactionsLoading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.transactionsLoading.set(false);
      },
    });
  }

  protected onUsersSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.usersTable()?.filterGlobal(value, 'contains');
  }

  protected displayValue(value: string | null | undefined): string {
    return value?.trim() ? value : '-';
  }

  protected roleLabel(isSuperuser: boolean): string {
    return isSuperuser ? 'admin' : 'user';
  }
}
