import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../../core/auth/services/auth.service';
import { BankPublic } from '../../../core/banks/models/bank.model';
import { BanksService } from '../../../core/banks/services/banks.service';
import { TranslatePipe } from '../../../core/i18n/pipes/translate.pipe';
import { APP_ROUTE_PATHS } from '../../../core/routing/app-route-paths';
import { UsersService } from '../../../core/users/services/users.service';

@Component({
  selector: 'app-deposit-bank-detail',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './deposit-bank-detail.html',
  styleUrl: './deposit-bank-detail.scss',
})
export class DepositBankDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly banksService = inject(BanksService);
  private readonly usersService = inject(UsersService);

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

  protected showLogo(bank: BankPublic): boolean {
    return Boolean(bank.bank_logo) && !this.logoBroken();
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

    this.authService.getMe().subscribe({
      next: (me) => {
        forkJoin({
          bank: this.banksService.getById(bankId),
          user: this.usersService.getById(me.id),
        }).subscribe({
          next: ({ bank, user }) => {
            const isEnabled =
              user.account?.banks?.some((link) => link.bank.id === bank.id && link.is_enabled) ??
              false;

            if (!isEnabled) {
              void this.router.navigateByUrl(this.depositPath);
              return;
            }

            this.bank.set(bank);
            this.loading.set(false);
          },
          error: () => {
            this.bank.set(null);
            this.loading.set(false);
            this.error.set(true);
          },
        });
      },
      error: () => {
        this.bank.set(null);
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }
}
