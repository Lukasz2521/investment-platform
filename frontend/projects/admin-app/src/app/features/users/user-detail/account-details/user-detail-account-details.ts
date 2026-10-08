import { Component, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { ToggleSwitch } from 'primeng/toggleswitch';

import {
  ACCOUNT_TYPE_OPTIONS,
  ACCOUNT_TYPE_PARTICIPATION,
  AccountType,
} from '../../../../core/users/models/account-type.model';
import { AccountPublicForUser, AccountUpdate } from '../../../../core/users/models/user.model';
import { UserDetailsService } from '../user-details.service';

@Component({
  selector: 'admin-app-user-detail-account-details',
  imports: [FormsModule, Select, InputText, IconField, InputIcon, ToggleSwitch],
  templateUrl: './user-detail-account-details.html',
  styleUrl: './user-detail-account-details.scss',
})
export class UserDetailAccountDetails {
  private readonly userDetailsService = inject(UserDetailsService);

  readonly userId = input.required<string>();
  readonly account = input<AccountPublicForUser | null>();

  protected readonly accountTypeOptions = [...ACCOUNT_TYPE_OPTIONS];
  protected readonly saving = signal(false);
  protected readonly participationError = signal('');

  protected accountType: AccountType | null = null;
  protected participationPercent = 0;
  protected customCampaigns = false;
  protected cardPayments = false;

  constructor() {
    effect(() => {
      const account = this.account();
      if (!account || this.saving()) {
        return;
      }

      this.accountType = account.account_type;
      this.participationPercent = account.participation;
      this.customCampaigns = account.custom_campaigns;
      this.cardPayments = account.card_payments;
    });
  }

  protected onAccountTypeChange(next: AccountType): void {
    const account = this.account();
    if (!account || !next || next === account.account_type || this.saving()) {
      return;
    }

    this.participationError.set('');
    this.participationPercent = ACCOUNT_TYPE_PARTICIPATION[next];
    this.save({
      account_type: next,
      participation: ACCOUNT_TYPE_PARTICIPATION[next],
    });
  }

  protected commitParticipation(): void {
    const account = this.account();
    if (!account || this.saving()) {
      return;
    }

    const value = Number(this.participationPercent);
    if (!Number.isInteger(value) || value < 0 || value > 100) {
      this.participationError.set('Participation must be a whole number from 0 to 100.');
      this.participationPercent = account.participation;
      return;
    }

    this.participationError.set('');
    if (value === account.participation) {
      return;
    }

    this.save({ participation: value });
  }

  protected onCustomCampaignsChange(enabled: boolean): void {
    const account = this.account();
    if (!account || enabled === account.custom_campaigns || this.saving()) {
      return;
    }

    this.save({ custom_campaigns: enabled });
  }

  protected onCardPaymentsChange(enabled: boolean): void {
    const account = this.account();
    if (!account || enabled === account.card_payments || this.saving()) {
      return;
    }

    this.save({ card_payments: enabled });
  }

  private save(update: AccountUpdate): void {
    const account = this.account();
    if (!account) {
      return;
    }

    this.saving.set(true);
    this.userDetailsService.updateAccount(this.userId(), update, {
      onSuccess: () => this.saving.set(false),
      onError: () => {
        this.accountType = account.account_type;
        this.participationPercent = account.participation;
        this.customCampaigns = account.custom_campaigns;
        this.cardPayments = account.card_payments;
        this.participationError.set('Could not save account settings.');
        this.saving.set(false);
      },
    });
  }
}
