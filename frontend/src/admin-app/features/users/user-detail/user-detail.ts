import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Card } from 'primeng/card';
import { Message } from 'primeng/message';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';

import { TransactionPublic } from '../../../core/transactions/models/transaction.model';
import { TransactionsService } from '../../../core/transactions/services/transactions.service';
import { UserPublic } from '../../../core/users/models/user.model';
import { UsersService } from '../../../core/users/services/users.service';
import {
  calculateUserFinancialSummary,
  UserFinancialSummary,
} from '../../../core/users/utils/user-transactions.utils';
import { getUserDisplayName } from '../../../core/users/utils/user-display.utils';
import { UserDetailAccountDetails } from './account-details/user-detail-account-details';
import { UserDetailProfile } from './profile/user-detail-profile';

@Component({
  selector: 'admin-app-user-detail',
  imports: [
    DecimalPipe,
    Card,
    Message,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    UserDetailAccountDetails,
    UserDetailProfile,
  ],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.scss',
})
export class UserDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly usersService = inject(UsersService);
  private readonly transactionsService = inject(TransactionsService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly loading = signal(true);
  protected readonly user = signal<UserPublic | null>(null);
  protected readonly financialSummary = signal<UserFinancialSummary>({
    availableBalance: 0,
    totalDeposit: 0,
    totalWithdraw: 0,
  });

  private loadedTransactions: TransactionPublic[] | null = null;

  protected readonly pageTitle = computed(() => {
    const currentUser = this.user();
    if (!currentUser) {
      return '';
    }

    return currentUser.username.trim() || getUserDisplayName(currentUser);
  });

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        this.loading.set(false);
        return;
      }

      const userId = this.route.snapshot.paramMap.get('userId');
      if (!userId) {
        this.loading.set(false);
        return;
      }

      this.loadUserProfile(userId);
      this.loadUserTransactions(userId);
    });
  }

  private loadUserProfile(userId: string): void {
    this.usersService.getById(userId).subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: () => {
        this.user.set(null);
        this.loading.set(false);
      },
    });
  }

  private loadUserTransactions(userId: string): void {
    this.transactionsService.getAll().subscribe({
      next: ({ data }) => {
        this.loadedTransactions = data;
        this.syncFinancialSummary(userId);
      },
    });
  }

  private syncFinancialSummary(userId: string): void {
    if (!this.loadedTransactions) {
      return;
    }

    const userTransactions = this.loadedTransactions.filter((tx) => tx.user_id === userId);
    this.financialSummary.set(calculateUserFinancialSummary(userTransactions));
  }
}
