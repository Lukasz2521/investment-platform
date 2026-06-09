import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Toolbar } from 'primeng/toolbar';

import { BankPublic } from '../../core/banks/models/bank.model';
import { BanksService } from '../../core/banks/services/banks.service';
import { BanksAddDialog } from './banks-add-dialog/banks-add-dialog';
import { BanksDeleteDialog } from './banks-delete-dialog/banks-delete-dialog';
import { BanksTable } from './banks-table/banks-table';

@Component({
  selector: 'admin-app-banks',
  imports: [Toolbar, Card, Button, BanksAddDialog, BanksDeleteDialog, BanksTable],
  templateUrl: './banks.html',
  styleUrl: './banks.scss',
})
export class Banks {
  private readonly banksService = inject(BanksService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly loading = signal(true);
  protected readonly banks = signal<BankPublic[]>([]);
  protected readonly addDialogVisible = signal(false);
  protected readonly deleteDialogVisible = signal(false);
  protected readonly bankToDelete = signal<BankPublic | null>(null);
  protected readonly deleting = signal(false);

  constructor() {
    effect(() => {
      if (!this.deleteDialogVisible()) {
        this.bankToDelete.set(null);
      }
    });

    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        this.loading.set(false);
        return;
      }

      this.loadBanks();
    });
  }

  private loadBanks(showLoading = false): void {
    if (showLoading) {
      this.loading.set(true);
    }

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

  protected openDeleteDialog(bank: BankPublic): void {
    this.bankToDelete.set(bank);
    this.deleteDialogVisible.set(true);
  }

  protected confirmDelete(): void {
    const bank = this.bankToDelete();
    if (!bank || this.deleting()) {
      return;
    }

    this.deleting.set(true);
    this.banksService.delete(bank.id).subscribe({
      next: () => {
        this.deleteDialogVisible.set(false);
        this.deleting.set(false);
        this.loadBanks(true);
      },
      error: () => this.deleting.set(false),
    });
  }
}
