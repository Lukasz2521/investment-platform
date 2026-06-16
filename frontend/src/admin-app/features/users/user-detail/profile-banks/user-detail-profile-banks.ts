import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  effect,
  inject,
  input,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleSwitch } from 'primeng/toggleswitch';

import { BankPublic } from '../../../../core/banks/models/bank.model';
import { BanksService } from '../../../../core/banks/services/banks.service';
import { AccountPublicForUser } from '../../../../core/users/models/user.model';
import { UsersService } from '../../../../core/users/services/users.service';
import { UserDetailsService } from '../user-details.service';

type BankToggleRow = {
  bank: BankPublic;
  isEnabled: boolean;
  updating: boolean;
};

@Component({
  selector: 'admin-app-user-detail-profile-banks',
  imports: [FormsModule, ToggleSwitch],
  templateUrl: './user-detail-profile-banks.html',
  styleUrl: './user-detail-profile-banks.scss',
})
export class UserDetailProfileBanks {
  private readonly banksService = inject(BanksService);
  private readonly usersService = inject(UsersService);
  private readonly userDetailsService = inject(UserDetailsService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly userId = input.required<string>();
  readonly account = input<AccountPublicForUser | null>();

  protected readonly loading = signal(true);
  protected readonly allBanks = signal<BankPublic[]>([]);
  private readonly enabledByBankId = signal<Record<string, boolean>>({});
  private readonly updatingBankIds = signal<Record<string, boolean>>({});

  protected readonly bankRows = computed<BankToggleRow[]>(() => {
    const enabledMap = this.enabledByBankId();
    const updatingMap = this.updatingBankIds();

    return this.allBanks().map((bank) => ({
      bank,
      isEnabled: enabledMap[bank.id] ?? false,
      updating: updatingMap[bank.id] ?? false,
    }));
  });

  constructor() {
    effect(() => {
      this.account();
      this.syncEnabledBanksFromAccount();
    });

    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        this.loading.set(false);
        return;
      }

      this.loadBanks();
    });
  }

  protected onBankToggle(row: BankToggleRow, isEnabled: boolean): void {
    if (!this.account() || row.updating) {
      return;
    }

    const previousValue = row.isEnabled;
    this.setBankEnabled(row.bank.id, isEnabled);
    this.setBankUpdating(row.bank.id, true);

    this.usersService.setAccountBankEnabled(this.userId(), row.bank.id, isEnabled).subscribe({
      next: () => {
        this.userDetailsService.loadUserDetails(this.userId());
        this.setBankUpdating(row.bank.id, false);
      },
      error: () => {
        this.setBankEnabled(row.bank.id, previousValue);
        this.setBankUpdating(row.bank.id, false);
      },
    });
  }

  private loadBanks(): void {
    this.loading.set(true);
    this.syncEnabledBanksFromAccount();

    this.banksService.getAll().subscribe({
      next: ({ data }) => {
        this.allBanks.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private syncEnabledBanksFromAccount(): void {
    const accountBanks = this.account()?.banks ?? [];
    this.enabledByBankId.set(
      Object.fromEntries(accountBanks.map((link) => [link.bank.id, link.is_enabled])),
    );
  }

  private setBankEnabled(bankId: string, isEnabled: boolean): void {
    this.enabledByBankId.update((current) => ({
      ...current,
      [bankId]: isEnabled,
    }));
  }

  private setBankUpdating(bankId: string, updating: boolean): void {
    this.updatingBankIds.update((current) => ({
      ...current,
      [bankId]: updating,
    }));
  }
}
