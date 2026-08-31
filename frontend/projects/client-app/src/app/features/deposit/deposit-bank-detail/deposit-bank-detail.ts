import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { BankPublic } from '../../../core/banks/models/bank.model';
import { BanksService } from '../../../core/banks/services/banks.service';
import { bankLogoUrl } from '../../../core/banks/utils/bank-logo-url';
import { TranslatePipe } from '../../../core/i18n/pipes/translate.pipe';
import { APP_ROUTE_PATHS } from '../../../core/routing/app-route-paths';

@Component({
  selector: 'app-deposit-bank-detail',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './deposit-bank-detail.html',
  styleUrl: './deposit-bank-detail.scss',
})
export class DepositBankDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly banksService = inject(BanksService);

  protected readonly depositPath = `/${APP_ROUTE_PATHS.deposit}`;
  protected readonly bank = signal<BankPublic | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly logoBroken = signal(false);

  ngOnInit(): void {
    const bankId = this.route.snapshot.paramMap.get('bankId');
    if (!bankId) {
      void this.router.navigateByUrl(this.depositPath);
      return;
    }

    this.loadBank(bankId);
  }

  protected logoUrl(bank: BankPublic): string | null {
    return bankLogoUrl(bank.bank_logo);
  }

  protected showLogo(bank: BankPublic): boolean {
    return Boolean(this.logoUrl(bank)) && !this.logoBroken();
  }

  protected onLogoError(): void {
    this.logoBroken.set(true);
  }

  protected getBankInitials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  protected displayValue(value: string | null | undefined): string {
    const trimmed = value?.trim();
    return trimmed ? trimmed : '—';
  }

  private loadBank(bankId: string): void {
    this.loading.set(true);
    this.error.set(false);

    this.banksService.getById(bankId).subscribe({
      next: (bank) => {
        this.bank.set(bank);
        this.loading.set(false);
      },
      error: () => {
        this.bank.set(null);
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }
}
