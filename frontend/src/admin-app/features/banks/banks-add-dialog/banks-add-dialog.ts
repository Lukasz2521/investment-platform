import { Component, inject, model, output, signal } from '@angular/core';
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
  readonly bankCreated = output<BankPublic>();

  protected readonly submitting = signal(false);
  protected readonly imagePreviewUrl = signal<string | null>(null);

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
    input.value = '';
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

    this.submitting.set(true);
    this.banksService
      .create({
        name: value.name.trim(),
        bank_address: value.bank_address.trim(),
        account_name: value.account_name.trim(),
        iban: value.iban.trim(),
        sepa: value.sepa.trim(),
        swift: value.swift.trim(),
        company_address: value.company_address.trim(),
        transfer_title: value.transfer_title.trim(),
        bank_description: value.bank_description.trim() || null,
        bank_logo: '',
      })
      .subscribe({
        next: (bank) => {
          this.bankCreated.emit(bank);
          this.closeDialog();
          this.submitting.set(false);
        },
        error: () => this.submitting.set(false),
      });
  }

  private resetForm(): void {
    this.form.reset();
    const previewUrl = this.imagePreviewUrl();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    this.imagePreviewUrl.set(null);
  }
}
