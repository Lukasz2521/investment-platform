import { Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';

import { BankPublic } from '../../../core/banks/models/bank.model';
import { BanksService } from '../../../core/banks/services/banks.service';

@Component({
  selector: 'admin-app-banks-add-dialog',
  imports: [ReactiveFormsModule, Dialog, Button, InputText],
  templateUrl: './banks-add-dialog.html',
  styleUrl: './banks-add-dialog.scss',
})
export class BanksAddDialog {
  private readonly banksService = inject(BanksService);
  private readonly formBuilder = inject(FormBuilder);

  readonly visible = model(false);
  readonly bank = input<BankPublic | null>(null);

  readonly bankSaved = output<BankPublic>();

  protected readonly submitting = signal(false);
  protected readonly imagePreviewUrl = signal<string | null>(null);
  protected readonly imageRemoved = signal(false);

  protected readonly isEditMode = computed(() => this.bank() !== null);
  protected readonly dialogHeader = computed(() =>
    this.isEditMode() ? 'Update Bank' : 'Add Bank',
  );
  protected readonly submitLabel = computed(() => (this.isEditMode() ? 'UPDATE' : 'CREATE'));
  protected readonly imageButtonLabel = computed(() =>
    this.isEditMode() ? 'CHANGE IMAGE' : 'UPLOAD IMAGE',
  );
  protected readonly displayImageUrl = computed(() => {
    if (this.imagePreviewUrl()) {
      return this.imagePreviewUrl();
    }

    if (this.imageRemoved()) {
      return null;
    }

    return this.bank()?.bank_logo ?? null;
  });

  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    bank_address: [''],
    account_name: ['', Validators.required],
    iban: [''],
    sepa: [''],
    swift: [''],
    company_address: [''],
    transfer_title: [''],
    bank_description: [''],
  });

  constructor() {
    effect(() => {
      if (!this.visible()) {
        return;
      }

      const bank = this.bank();
      if (bank) {
        this.patchFormFromBank(bank);
      } else {
        this.resetForm();
      }
    });
  }

  protected onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const previousPreviewUrl = this.imagePreviewUrl();
    if (previousPreviewUrl) {
      URL.revokeObjectURL(previousPreviewUrl);
    }

    this.imagePreviewUrl.set(URL.createObjectURL(file));
    this.imageRemoved.set(false);
    input.value = '';
  }

  protected removeImage(): void {
    const previewUrl = this.imagePreviewUrl();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    this.imagePreviewUrl.set(null);
    this.imageRemoved.set(true);
  }

  protected closeDialog(): void {
    this.resetForm();
    this.visible.set(false);
  }

  protected submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const bankLogo = this.imageRemoved()
      ? ''
      : this.imagePreviewUrl()
        ? ''
        : (this.bank()?.bank_logo ?? '');
    const payload = {
      name: value.name.trim(),
      bank_address: value.bank_address.trim(),
      account_name: value.account_name.trim(),
      iban: value.iban.trim(),
      sepa: value.sepa.trim(),
      swift: value.swift.trim(),
      company_address: value.company_address.trim(),
      transfer_title: value.transfer_title.trim(),
      bank_description: value.bank_description.trim() || null,
      bank_logo: bankLogo,
    };

    const bank = this.bank();
    this.submitting.set(true);

    const request$ = bank
      ? this.banksService.update(bank.id, payload)
      : this.banksService.create(payload);

    request$.subscribe({
      next: (savedBank) => {
        this.bankSaved.emit(savedBank);
        this.closeDialog();
        this.submitting.set(false);
      },
      error: () => this.submitting.set(false),
    });
  }

  private patchFormFromBank(bank: BankPublic): void {
    this.form.patchValue({
      name: bank.name,
      bank_address: bank.bank_address,
      account_name: bank.account_name,
      iban: bank.iban,
      sepa: bank.sepa,
      swift: bank.swift,
      company_address: bank.company_address,
      transfer_title: bank.transfer_title,
      bank_description: bank.bank_description ?? '',
    });
    this.imagePreviewUrl.set(null);
    this.imageRemoved.set(false);
  }

  private resetForm(): void {
    this.form.reset();
    const previewUrl = this.imagePreviewUrl();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    this.imagePreviewUrl.set(null);
    this.imageRemoved.set(false);
  }
}
