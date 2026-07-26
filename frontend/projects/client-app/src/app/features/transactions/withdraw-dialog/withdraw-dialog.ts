import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, HostListener, inject, output, signal } from '@angular/core';

import { TranslatePipe } from '../../../core/i18n/pipes/translate.pipe';
import { TranslationService } from '../../../core/i18n/services/translation.service';
import { WithdrawTransferType } from '../../../core/transactions/models/transaction.model';
import { TransactionsService } from '../../../core/transactions/services/transactions.service';

@Component({
  selector: 'app-withdraw-dialog',
  imports: [TranslatePipe],
  templateUrl: './withdraw-dialog.html',
  styleUrl: './withdraw-dialog.scss',
})
export class WithdrawDialog {
  private readonly transactionsService = inject(TransactionsService);
  private readonly translationService = inject(TranslationService);

  readonly closed = output<void>();
  readonly submitted = output<void>();

  protected readonly accountHolderName = signal('');
  protected readonly paymentPurpose = signal('');
  protected readonly transferType = signal<WithdrawTransferType>('sepa');
  protected readonly sepaAddress = signal('');
  protected readonly bankAddress = signal('');
  protected readonly amount = signal('0');
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly canSubmit = computed(() => {
    const amountValue = Number(this.amount().replace(',', '.'));

    return (
      !this.submitting() &&
      this.accountHolderName().trim().length > 0 &&
      this.paymentPurpose().trim().length > 0 &&
      this.sepaAddress().trim().length > 0 &&
      this.bankAddress().trim().length > 0 &&
      Number.isFinite(amountValue) &&
      amountValue > 0
    );
  });

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (!this.submitting()) {
      this.close();
    }
  }

  protected close(): void {
    if (this.submitting()) {
      return;
    }

    this.closed.emit();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  protected onAccountHolderNameInput(event: Event): void {
    this.accountHolderName.set((event.target as HTMLInputElement).value);
  }

  protected onPaymentPurposeInput(event: Event): void {
    this.paymentPurpose.set((event.target as HTMLInputElement).value);
  }

  protected onSepaAddressInput(event: Event): void {
    this.sepaAddress.set((event.target as HTMLInputElement).value);
  }

  protected onBankAddressInput(event: Event): void {
    this.bankAddress.set((event.target as HTMLInputElement).value);
  }

  protected onAmountInput(event: Event): void {
    this.amount.set((event.target as HTMLInputElement).value);
  }

  protected setTransferType(type: WithdrawTransferType): void {
    this.transferType.set(type);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();

    if (!this.canSubmit()) {
      return;
    }

    const amountValue = this.amount().trim().replace(',', '.');
    this.submitting.set(true);
    this.error.set(null);

    this.transactionsService
      .createWithdraw({
        amount: amountValue,
        account_holder_name: this.accountHolderName().trim(),
        payment_purpose: this.paymentPurpose().trim(),
        transfer_type: this.transferType(),
        sepa_address: this.sepaAddress().trim(),
        bank_address: this.bankAddress().trim(),
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.submitted.emit();
        },
        error: (error: HttpErrorResponse) => {
          this.submitting.set(false);
          const detail = error.error?.detail;
          this.error.set(
            typeof detail === 'string'
              ? detail
              : this.translationService.translate('app.transactions.withdrawDialog.error'),
          );
        },
      });
  }
}
