import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, effect, inject, PLATFORM_ID, signal } from '@angular/core';
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
import { TransactionsCreateDialog } from './transactions-create-dialog/transactions-create-dialog';
import { TransactionsDeleteDialog } from './transactions-delete-dialog/transactions-delete-dialog';
import { TransactionsUpdateDialog } from './transactions-update-dialog/transactions-update-dialog';

@Component({
  selector: 'admin-app-transactions-list',
  imports: [
    Toolbar,
    Card,
    Button,
    TransactionsTable,
    TransactionsCreateDialog,
    TransactionsDeleteDialog,
    TransactionsUpdateDialog,
  ],
  templateUrl: './transactions-list.html',
  styleUrl: './transactions-list.scss',
})
export class TransactionsList {
  private readonly transactionsService = inject(TransactionsService);
  private readonly usersService = inject(UsersService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly loading = signal(true);
  protected readonly transactions = signal<TransactionTableRow[]>([]);
  protected readonly users = signal<UserPublic[]>([]);
  protected readonly formDialogVisible = signal(false);
  protected readonly editDialogVisible = signal(false);
  protected readonly deleteDialogVisible = signal(false);
  protected readonly transactionToEdit = signal<TransactionTableRow | null>(null);
  protected readonly transactionToDelete = signal<TransactionTableRow | null>(null);
  protected readonly deleting = signal(false);

  private loadedTransactions: TransactionPublic[] | null = null;
  private loadedUsers: UserPublic[] | null = null;

  constructor() {
    effect(() => {
      if (!this.editDialogVisible()) {
        this.transactionToEdit.set(null);
      }
    });

    effect(() => {
      if (!this.deleteDialogVisible()) {
        this.transactionToDelete.set(null);
      }
    });

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
        this.users.set(data);
        this.syncTransactions();
      },
      error: () => this.loading.set(false),
    });
  }

  private loadTransactions(showLoading = false): void {
    if (showLoading) {
      this.loading.set(true);
    }

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

  protected openAddDialog(): void {
    this.formDialogVisible.set(true);
  }

  protected onTransactionCreated(): void {
    this.loadTransactions(true);
  }

  protected openEditDialog(transaction: TransactionTableRow): void {
    this.transactionToEdit.set(transaction);
    this.editDialogVisible.set(true);
  }

  protected onTransactionUpdated(): void {
    this.loadTransactions(true);
  }

  protected openDeleteDialog(transaction: TransactionTableRow): void {
    this.transactionToDelete.set(transaction);
    this.deleteDialogVisible.set(true);
  }

  protected confirmDelete(): void {
    const transaction = this.transactionToDelete();
    if (!transaction || this.deleting()) {
      return;
    }

    this.deleting.set(true);
    this.transactionsService.delete(transaction.id).subscribe({
      next: () => {
        this.deleteDialogVisible.set(false);
        this.deleting.set(false);
        this.loadTransactions(true);
      },
      error: () => this.deleting.set(false),
    });
  }
}
