import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../core/auth/services/auth.service';
import { BankPublic } from '../../core/banks/models/bank.model';
import { BanksService } from '../../core/banks/services/banks.service';
import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { APP_ROUTE_PATHS } from '../../core/routing/app-route-paths';
import { UsersService } from '../../core/users/services/users.service';
import { DEPOSIT_PAYMENT_METHODS, PaymentMethod } from './deposit-payment-methods';

export type DepositBankRow = {
  bank: BankPublic;
  isEnabled: boolean;
};

@Component({
  selector: 'app-deposit',
  imports: [TranslatePipe],
  templateUrl: './deposit.html',
  styleUrl: './deposit.scss',
})
export class Deposit implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly banksService = inject(BanksService);
  private readonly usersService = inject(UsersService);
  private readonly router = inject(Router);

  protected readonly paymentMethods = DEPOSIT_PAYMENT_METHODS;
  protected readonly expandedMethodId = signal<PaymentMethod['id'] | null>(null);

  protected readonly bankRows = signal<DepositBankRow[]>([]);
  protected readonly banksLoading = signal(false);
  protected readonly banksError = signal(false);
  protected readonly bankSearch = signal('');
  protected readonly brokenLogoIds = signal<ReadonlySet<string>>(new Set());

  protected readonly filteredBanks = computed(() => {
    const query = this.bankSearch().trim().toLowerCase();
    const rows = this.bankRows();

    if (!query) {
      return rows;
    }

    return rows.filter((row) => row.bank.name.toLowerCase().includes(query));
  });

  ngOnInit(): void {
    this.loadBanks();
  }

  protected isExpanded(method: PaymentMethod): boolean {
    return method.expandable && this.expandedMethodId() === method.id;
  }

  protected toggleMethod(method: PaymentMethod): void {
    if (!method.expandable) {
      return;
    }

    this.expandedMethodId.update((current) => (current === method.id ? null : method.id));
  }

  protected onBankSearch(event: Event): void {
    this.bankSearch.set((event.target as HTMLInputElement).value);
  }

  protected openBankDetail(row: DepositBankRow): void {
    if (!row.isEnabled) {
      return;
    }

    void this.router.navigate(['/', APP_ROUTE_PATHS.deposit, row.bank.id]);
  }

  protected onLogoError(bankId: string): void {
    this.brokenLogoIds.update((current) => {
      const next = new Set(current);
      next.add(bankId);
      return next;
    });
  }

  protected showLogo(bank: BankPublic): boolean {
    return Boolean(bank.bank_logo) && !this.brokenLogoIds().has(bank.id);
  }

  protected getBankInitials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  private loadBanks(): void {
    this.banksLoading.set(true);
    this.banksError.set(false);

    this.authService.getMe().subscribe({
      next: (me) => {
        forkJoin({
          banks: this.banksService.getAll(),
          user: this.usersService.getById(me.id),
        }).subscribe({
          next: ({ banks, user }) => {
            const enabledByBankId = new Map(
              (user.account?.banks ?? []).map((link) => [link.bank.id, link.is_enabled]),
            );

            this.bankRows.set(
              banks.data.map((bank) => ({
                bank,
                isEnabled: enabledByBankId.get(bank.id) ?? false,
              })),
            );
            this.banksLoading.set(false);
          },
          error: () => {
            this.bankRows.set([]);
            this.banksLoading.set(false);
            this.banksError.set(true);
          },
        });
      },
      error: () => {
        this.bankRows.set([]);
        this.banksLoading.set(false);
        this.banksError.set(true);
      },
    });
  }
}
