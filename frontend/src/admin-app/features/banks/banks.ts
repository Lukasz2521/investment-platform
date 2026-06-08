import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Toolbar } from 'primeng/toolbar';

import { BankPublic } from '../../core/banks/models/bank.model';
import { BanksService } from '../../core/banks/services/banks.service';
import { BanksAddDialog } from './banks-add-dialog/banks-add-dialog';
import { BanksTable } from './banks-table/banks-table';

@Component({
  selector: 'admin-app-banks',
  imports: [Toolbar, Card, Button, BanksAddDialog, BanksTable],
  templateUrl: './banks.html',
  styleUrl: './banks.scss',
})
export class Banks {
  private readonly banksService = inject(BanksService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly loading = signal(true);
  protected readonly banks = signal<BankPublic[]>([]);
  protected readonly addDialogVisible = signal(false);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        this.loading.set(false);
        return;
      }

      this.loadBanks();
    });
  }

  private loadBanks(): void {
    this.banksService.getAll().subscribe({
      next: ({ data }) => {
        this.banks.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected openAddDialog(): void {
    this.addDialogVisible.set(true);
  }

  protected onBankCreated(bank: BankPublic): void {
    this.banks.update((currentBanks) => [bank, ...currentBanks]);
  }
}
