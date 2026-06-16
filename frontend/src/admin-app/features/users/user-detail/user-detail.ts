import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, computed, inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Card } from 'primeng/card';
import { Message } from 'primeng/message';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';

import { getUserDisplayName } from '../../../core/users/utils/user-display.utils';
import { UserDetailAccountDetails } from './account-details/user-detail-account-details';
import { UserDetailProfile } from './profile/user-detail-profile';
import { UserDetailProfileBanks } from './profile-banks/user-detail-profile-banks';
import { UserDetailsService } from './user-details.service';

@Component({
  selector: 'admin-app-user-detail',
  imports: [
    DecimalPipe,
    Card,
    Message,
    ProgressSpinner,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    UserDetailAccountDetails,
    UserDetailProfile,
    UserDetailProfileBanks,
  ],
  providers: [UserDetailsService],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.scss',
})
export class UserDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly userDetailsService = inject(UserDetailsService);

  protected readonly user = this.userDetailsService.user;
  protected readonly transactions = this.userDetailsService.transactions;

  protected readonly userDetailsIsLoading = computed(
    () => this.userDetailsService.userIsLoading()
  );

  protected readonly transactionsIsLoading = computed(
    () => this.userDetailsService.transactionsIsLoading()
  );

  protected readonly pageTitle = computed(() => {
    const currentUser = this.user();

    return currentUser.username.trim() || getUserDisplayName(currentUser);
  });

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      const userId = this.route.snapshot.paramMap.get('userId');
      if (!userId) {
        return;
      }

      this.userDetailsService.loadUserDetails(userId);
      this.userDetailsService.loadUserTransactions(userId);
    });
  }
}
