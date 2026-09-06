import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, input, model, output, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';

import { CampaignCreate, CampaignPublic } from '../../../core/campaigns/models/campaign.model';
import { CategoryPublic } from '../../../core/campaigns/models/category.model';
import { CampaignsService } from '../../../core/campaigns/services/campaigns.service';
import { ACCOUNT_TYPE_OPTIONS, AccountType } from '../../../core/users/models/account-type.model';

const INTEGER_PATTERN = /^\d+$/;
const DECIMAL_PATTERN = /^\d+(\.\d{1,4})?$/;

@Component({
  selector: 'admin-app-campaigns-form-dialog',
  imports: [ReactiveFormsModule, Dialog, Button, InputText, Select],
  templateUrl: './campaigns-form-dialog.html',
  styleUrl: './campaigns-form-dialog.scss',
})
export class CampaignsFormDialog {
  private readonly campaignsService = inject(CampaignsService);
  private readonly formBuilder = inject(FormBuilder);

  readonly visible = model(false);
  readonly campaign = input<CampaignPublic | null>(null);
  readonly categories = input<CategoryPublic[]>([]);

  readonly campaignSaved = output<CampaignPublic>();

  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly accountTypeOptions = [...ACCOUNT_TYPE_OPTIONS];

  private dialogSessionKey: string | null = null;

  protected readonly isEditMode = computed(() => this.campaign() !== null);
  protected readonly dialogHeader = computed(() =>
    this.isEditMode() ? 'Edit Campaign' : 'Create Campaign',
  );
  protected readonly submitLabel = computed(() => (this.isEditMode() ? 'UPDATE' : 'SAVE'));
  protected readonly categoryOptions = computed(() =>
    this.categories().map((category) => ({ label: category.name, value: category.id })),
  );

  protected readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.pattern(/\S+/)]],
    category_id: [null as string | null, Validators.required],
    min_days: ['3', [Validators.required, Validators.pattern(INTEGER_PATTERN), Validators.min(3)]],
    days_count: ['3', [Validators.required, Validators.pattern(INTEGER_PATTERN), Validators.min(3)]],
    budget: ['200', [Validators.required, Validators.pattern(DECIMAL_PATTERN), Validators.min(200)]],
    currency: ['EUR', [Validators.required, Validators.pattern(/\S+/)]],
    min_account: [AccountType.Fundamental, Validators.required],
    location: ['', [Validators.required, Validators.pattern(/\S+/)]],
    cpm_base: ['0', [Validators.required, Validators.pattern(DECIMAL_PATTERN)]],
    cpm_min: ['0', [Validators.required, Validators.pattern(DECIMAL_PATTERN)]],
    cpm_max: ['0', [Validators.required, Validators.pattern(DECIMAL_PATTERN)]],
    epc_min: ['0', [Validators.required, Validators.pattern(DECIMAL_PATTERN), Validators.min(0), Validators.max(100)]],
    epc_max: ['0', [Validators.required, Validators.pattern(DECIMAL_PATTERN), Validators.min(0), Validators.max(100)]],
    ctr_min: ['0', [Validators.required, Validators.pattern(DECIMAL_PATTERN), Validators.min(0), Validators.max(100)]],
    ctr_max: ['0', [Validators.required, Validators.pattern(DECIMAL_PATTERN), Validators.min(0), Validators.max(100)]],
    image_url: [''],
    video_url: [''],
  });

  constructor() {
    effect(() => {
      const isVisible = this.visible();
      const sessionKey = isVisible ? (this.campaign()?.id ?? 'new') : null;

      if (!isVisible) {
        this.dialogSessionKey = null;
        return;
      }

      if (this.dialogSessionKey === sessionKey) {
        return;
      }

      this.dialogSessionKey = sessionKey;
      untracked(() => {
        const campaign = this.campaign();
        if (campaign) {
          this.patchFormFromCampaign(campaign);
        } else {
          this.resetForm();
        }
      });
    });
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

    const payload = this.buildPayload();
    if (!payload) {
      return;
    }

    const rangeError = this.metricRangeError(payload);
    if (rangeError) {
      this.submitError.set(rangeError);
      return;
    }

    const campaign = this.campaign();
    this.submitting.set(true);
    this.submitError.set(null);

    const request$ = campaign
      ? this.campaignsService.update(campaign.id, payload)
      : this.campaignsService.create(payload);

    request$.subscribe({
      next: (savedCampaign) => {
        this.campaignSaved.emit(savedCampaign);
        this.closeDialog();
        this.submitting.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.submitError.set(this.apiErrorMessage(error));
        this.submitting.set(false);
      },
    });
  }

  private buildPayload(): CampaignCreate | null {
    const value = this.form.getRawValue();
    if (!value.category_id) {
      return null;
    }

    const location = value.location
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (!location.length) {
      this.submitError.set('Add at least one location.');
      return null;
    }

    return {
      title: value.title.trim(),
      category_id: value.category_id,
      min_days: Number(value.min_days),
      days_count: Number(value.days_count),
      budget: this.parseDecimal(value.budget),
      currency: value.currency.trim(),
      min_account: value.min_account,
      location,
      cpm_base: this.parseDecimal(value.cpm_base),
      cpm_min: this.parseDecimal(value.cpm_min),
      cpm_max: this.parseDecimal(value.cpm_max),
      epc_min: this.parseDecimal(value.epc_min),
      epc_max: this.parseDecimal(value.epc_max),
      ctr_min: this.parseDecimal(value.ctr_min),
      ctr_max: this.parseDecimal(value.ctr_max),
      image_url: value.image_url.trim(),
      video_url: value.video_url.trim(),
    };
  }

  private metricRangeError(payload: CampaignCreate): string | null {
    if (payload.cpm_min > payload.cpm_max) {
      return 'CPM min cannot be greater than CPM max.';
    }
    if (payload.cpm_base > payload.cpm_max) {
      return 'CPM base cannot be greater than CPM max.';
    }
    if (payload.epc_min > payload.epc_max) {
      return 'EPC min cannot be greater than EPC max.';
    }
    if (payload.ctr_min > payload.ctr_max) {
      return 'CTR min cannot be greater than CTR max.';
    }
    return null;
  }

  private apiErrorMessage(error: HttpErrorResponse): string {
    const detail = error.error?.detail;
    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }

    if (Array.isArray(detail)) {
      const messages = detail
        .map((item: { msg?: string }) => item?.msg)
        .filter((msg: string | undefined): msg is string => Boolean(msg));
      if (messages.length) {
        return messages.join(' ');
      }
    }

    return 'Could not save the campaign. Please try again.';
  }

  private patchFormFromCampaign(campaign: CampaignPublic): void {
    this.form.reset({
      title: campaign.title,
      category_id: campaign.category_id,
      min_days: String(campaign.min_days),
      days_count: String(campaign.days_count),
      budget: this.toFormNumber(campaign.budget),
      currency: campaign.currency,
      min_account: campaign.min_account,
      location: campaign.location.join(', '),
      cpm_base: this.toFormNumber(campaign.cpm_base),
      cpm_min: this.toFormNumber(campaign.cpm_min),
      cpm_max: this.toFormNumber(campaign.cpm_max),
      epc_min: this.toFormNumber(campaign.epc_min),
      epc_max: this.toFormNumber(campaign.epc_max),
      ctr_min: this.toFormNumber(campaign.ctr_min),
      ctr_max: this.toFormNumber(campaign.ctr_max),
      image_url: campaign.image_url,
      video_url: campaign.video_url,
    });
    this.submitError.set(null);
  }

  private resetForm(): void {
    this.form.reset({
      title: '',
      category_id: null,
      min_days: '3',
      days_count: '3',
      budget: '200',
      currency: 'EUR',
      min_account: AccountType.Fundamental,
      location: '',
      cpm_base: '0',
      cpm_min: '0',
      cpm_max: '0',
      epc_min: '0',
      epc_max: '0',
      ctr_min: '0',
      ctr_max: '0',
      image_url: '',
      video_url: '',
    });
    this.submitError.set(null);
  }

  private parseDecimal(value: string): number {
    return Number(value.trim().replace(',', '.'));
  }

  private toFormNumber(value: string | number): string {
    return String(value);
  }
}
