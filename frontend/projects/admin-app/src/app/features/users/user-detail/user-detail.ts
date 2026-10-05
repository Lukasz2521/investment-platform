import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Message } from 'primeng/message';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';

import { getUserDisplayName } from '../../../core/users/utils/user-display.utils';
import { AppRoutingService } from '../../../core/routing/app-routing.service';
import { UserDetailAccountDetails } from './account-details/user-detail-account-details';
import { UserDetailCampaigns } from './campaigns/user-detail-campaigns';
import { UserDetailDeleteDialog } from './delete-dialog/user-detail-delete-dialog';
import { UserDetailDocuments } from './documents/user-detail-documents';
import { UserDetailMakeAdminDialog } from './make-admin-dialog/user-detail-make-admin-dialog';
import { UserDetailProfile } from './profile/user-detail-profile';
import { UserDetailProfileBanks } from './profile-banks/user-detail-profile-banks';
import { UserDetailTransactions } from './transactions/user-detail-transactions';
import { UserDetailWithdraws } from './withdraws/user-detail-withdraws';
import { UserDetailsService } from './user-details.service';

@Component({
  selector: 'admin-app-user-detail',
  imports: [
    DecimalPipe,
    Button,
    Card,
    Message,
    ProgressSpinner,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    UserDetailAccountDetails,
    UserDetailCampaigns,
    UserDetailDeleteDialog,
    UserDetailDocuments,
    UserDetailMakeAdminDialog,
    UserDetailProfile,
    UserDetailProfileBanks,
    UserDetailTransactions,
    UserDetailWithdraws,
  ],
  providers: [UserDetailsService],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.scss',
})
export class UserDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly appRouting = inject(AppRoutingService);
  private readonly userDetailsService = inject(UserDetailsService);

  protected readonly user = this.userDetailsService.user;

  protected readonly userDetailsIsLoading = computed(
    () => this.userDetailsService.userIsLoading()
  );

  protected readonly pageTitle = computed(() => {
    const currentUser = this.user();

    return currentUser.username.trim() || getUserDisplayName(currentUser);
  });

  protected readonly makeAdminDialogVisible = signal(false);
  protected readonly makeAdminSubmitting = signal(false);
  protected readonly deleteDialogVisible = signal(false);
  protected readonly deleteSubmitting = signal(false);
  protected readonly activeTab = signal('profile');

  protected onTabChange(value: string | number | undefined): void {
    this.activeTab.set(String(value ?? 'profile'));
  }

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
    });
  }

  protected openMakeAdminDialog(): void {
    this.makeAdminDialogVisible.set(true);
  }

  protected confirmMakeAdmin(): void {
    const currentUser = this.user();
    if (!currentUser.id || currentUser.is_superuser || this.makeAdminSubmitting()) {
      return;
    }

    this.makeAdminSubmitting.set(true);
    this.userDetailsService.makeAdmin(currentUser.id, {
      onSuccess: () => {
        this.makeAdminDialogVisible.set(false);
        this.makeAdminSubmitting.set(false);
      },
      onError: () => {
        this.makeAdminSubmitting.set(false);
      },
    });
  }

  protected openDeleteDialog(): void {
    this.deleteDialogVisible.set(true);
  }

  protected confirmDeleteUser(): void {
    const currentUser = this.user();
    if (!currentUser.id || this.deleteSubmitting()) {
      return;
    }

    this.deleteSubmitting.set(true);
    this.userDetailsService.deleteUser(currentUser.id, {
      onSuccess: () => {
        this.deleteDialogVisible.set(false);
        this.deleteSubmitting.set(false);
        this.appRouting.navigateToUsers();
      },
      onError: () => {
        this.deleteSubmitting.set(false);
      },
    });
  }
}
