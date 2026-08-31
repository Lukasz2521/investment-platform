import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { BankPublic } from '../../core/banks/models/bank.model';
import { BanksService } from '../../core/banks/services/banks.service';
import { bankLogoUrl } from '../../core/banks/utils/bank-logo-url';
import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { APP_ROUTE_PATHS } from '../../core/routing/app-route-paths';
import { DEPOSIT_PAYMENT_METHODS, PaymentMethod } from './deposit-payment-methods';

@Component({
  selector: 'app-deposit',
  imports: [TranslatePipe],
  templateUrl: './deposit.html',
  styleUrl: './deposit.scss',
})
export class Deposit implements OnInit {
  private readonly banksService = inject(BanksService);
  private readonly router = inject(Router);

  protected readonly paymentMethods = DEPOSIT_PAYMENT_METHODS;
  protected readonly expandedMethodId = signal<PaymentMethod['id'] | null>(null);

  protected readonly banks = signal<BankPublic[]>([]);
  protected readonly banksLoading = signal(false);
  protected readonly banksError = signal(false);
  protected readonly bankSearch = signal('');
  protected readonly brokenLogoIds = signal<ReadonlySet<string>>(new Set());

  protected readonly filteredBanks = computed(() => {
    const query = this.bankSearch().trim().toLowerCase();
    const banks = this.banks();

    if (!query) {
      return banks;
    }

    return banks.filter((bank) => bank.name.toLowerCase().includes(query));
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

  protected openBankDetail(bank: BankPublic): void {
    void this.router.navigate(['/', APP_ROUTE_PATHS.deposit, bank.id]);
  }

  protected onLogoError(bankId: string): void {
    this.brokenLogoIds.update((current) => {
      const next = new Set(current);
      next.add(bankId);
      return next;
    });
  }

  protected logoUrl(bank: BankPublic): string | null {
    return bankLogoUrl(bank.bank_logo);
  }

  protected showLogo(bank: BankPublic): boolean {
    return Boolean(this.logoUrl(bank)) && !this.brokenLogoIds().has(bank.id);
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

    this.banksService.getAll().subscribe({
      next: (banks) => {
        this.banks.set(banks.data);
        this.banksLoading.set(false);
      },
      error: () => {
        this.banks.set([]);
        this.banksLoading.set(false);
        this.banksError.set(true);
      },
    });
  }
}
