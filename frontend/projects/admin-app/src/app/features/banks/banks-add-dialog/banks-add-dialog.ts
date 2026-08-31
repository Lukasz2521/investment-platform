import { Component, computed, effect, inject, input, model, output, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Observable } from 'rxjs';

import { BankPublic } from '../../../core/banks/models/bank.model';
import { BanksService } from '../../../core/banks/services/banks.service';
import { bankLogoUrl } from '../../../core/banks/utils/bank-logo-url';

const ALLOWED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']);
const ALLOWED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

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
  protected readonly imageError = signal<string | null>(null);

  private selectedImageFile: File | null = null;
  private dialogSessionKey: string | null = null;

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

    return bankLogoUrl(this.bank()?.bank_logo);
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
      const isVisible = this.visible();
      const sessionKey = isVisible ? (this.bank()?.id ?? 'new') : null;

      if (!isVisible) {
        this.dialogSessionKey = null;
        return;
      }

      if (this.dialogSessionKey === sessionKey) {
        return;
      }

      this.dialogSessionKey = sessionKey;
      untracked(() => {
        const bank = this.bank();
        if (bank) {
          this.patchFormFromBank(bank);
        } else {
          this.resetForm();
        }
      });
    });
  }

  protected onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) {
      return;
    }

    if (!this.isAllowedImage(file) || file.size > MAX_IMAGE_BYTES) {
      this.imageError.set('Use a PNG, JPEG, WEBP or GIF image up to 2 MB.');
      return;
    }

    const previousPreviewUrl = this.imagePreviewUrl();
    if (previousPreviewUrl) {
      URL.revokeObjectURL(previousPreviewUrl);
    }

    this.imageError.set(null);
    this.selectedImageFile = file;
    this.imagePreviewUrl.set(URL.createObjectURL(file));
    this.imageRemoved.set(false);
  }

  protected removeImage(): void {
    const previewUrl = this.imagePreviewUrl();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    this.imagePreviewUrl.set(null);
    this.selectedImageFile = null;
    this.imageRemoved.set(true);
    this.imageError.set(null);
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

    const file = this.selectedImageFile;
    const imageRemoved = this.imageRemoved();
    const value = this.form.getRawValue();
    const payload = {
      name: value.name.trim(),
      bank_address: value.bank_address.trim(),
      account_name: value.account_name.trim(),
      iban: value.iban.trim(),
      sepa: value.sepa.trim(),
      swift: value.swift.trim(),
      company_address: value.company_address.trim(),
      transfer_title: value.transfer_title.trim(),
      bank_description: value.bank_description.trim(),
    };

    const bank = this.bank();
    this.submitting.set(true);
    this.imageError.set(null);

    const request$: Observable<BankPublic> = bank
      ? this.banksService.update(bank.id, payload, { logo: file, removeLogo: imageRemoved })
      : this.banksService.create(payload, file);

    request$.subscribe({
      next: (savedBank) => {
        this.bankSaved.emit(savedBank);
        this.closeDialog();
        this.submitting.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.imageError.set(this.apiErrorMessage(error, file));
        this.submitting.set(false);
      },
    });
  }

  private apiErrorMessage(error: HttpErrorResponse, file: File | null): string {
    const detail = error.error?.detail;
    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }

    if (file) {
      return 'Could not save the bank image. Please try again.';
    }

    return 'Could not save the bank. Please try again.';
  }

  private isAllowedImage(file: File): boolean {
    if (ALLOWED_IMAGE_TYPES.has(file.type)) {
      return true;
    }

    const name = file.name.toLowerCase();
    return ALLOWED_IMAGE_EXTENSIONS.some((extension) => name.endsWith(extension));
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
    this.clearImageState();
  }

  private resetForm(): void {
    this.form.reset();
    this.clearImageState();
  }

  private clearImageState(): void {
    const previewUrl = this.imagePreviewUrl();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    this.imagePreviewUrl.set(null);
    this.selectedImageFile = null;
    this.imageRemoved.set(false);
    this.imageError.set(null);
  }
}
