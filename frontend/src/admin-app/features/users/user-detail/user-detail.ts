import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Avatar } from 'primeng/avatar';
import { Card } from 'primeng/card';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { ToggleSwitch } from 'primeng/toggleswitch';

import { TransactionsService } from '../../../core/transactions/services/transactions.service';
import { AccountType, ACCOUNT_TYPE_OPTIONS } from '../../../core/users/models/account-type.model';
import { UserPublic } from '../../../core/users/models/user.model';
import { UsersService } from '../../../core/users/services/users.service';
import {
  calculateUserFinancialSummary,
  UserFinancialSummary,
} from '../../../core/users/utils/user-transactions.utils';
import {
  getUserDisplayName,
  getUserInitials,
  getUserRoleLabel,
} from '../../../core/users/utils/user-display.utils';

@Component({
  selector: 'admin-app-user-detail',
  imports: [
    DecimalPipe,
    FormsModule,
    Card,
    Avatar,
    Select,
    InputText,
    IconField,
    InputIcon,
    ToggleSwitch,
    Message,
  ],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.scss',
})
export class UserDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly usersService = inject(UsersService);
  private readonly transactionsService = inject(TransactionsService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly accountTypeOptions = [...ACCOUNT_TYPE_OPTIONS];
  protected readonly loading = signal(true);
  protected readonly user = signal<UserPublic | null>(null);
  protected readonly financialSummary = signal<UserFinancialSummary>({
    availableBalance: 0,
    totalDeposit: 0,
    totalWithdraw: 0,
  });

  protected accountType = AccountType.Dominion;
  protected participationPercent = 59;
  protected customCampaigns = true;
  protected cardPayments = false;

  protected readonly pageTitle = computed(() => {
    const currentUser = this.user();
    if (!currentUser) {
      return '';
    }

    return currentUser.username.trim() || getUserDisplayName(currentUser);
  });

  protected readonly userInitials = computed(() => getUserInitials(this.user()));
  protected readonly userRoleLabel = computed(() => getUserRoleLabel(this.user()));

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

      this.loadUser(userId);
    });
  }

  private loadUser(userId: string): void {
    forkJoin({
      user: this.usersService.getById(userId),
      transactions: this.transactionsService.getAll(),
    }).subscribe({
      next: ({ user, transactions }) => {
        this.user.set(user);
        const userTransactions = transactions.data.filter((tx) => tx.user_id === userId);
        this.financialSummary.set(calculateUserFinancialSummary(userTransactions));
        this.loading.set(false);
      },
      error: () => {
        this.user.set(null);
        this.loading.set(false);
      },
    });
  }

  protected displayValue(value: string | null | undefined): string {
    return value?.trim() ? value : '-';
  }
}
