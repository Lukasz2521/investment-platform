import { Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';

import { NewsPublic } from '../../../core/news/models/news.model';
import { NewsService } from '../../../core/news/services/news.service';

function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toIsoDate(value: string | null | undefined): string {
  if (!value) {
    return todayIsoDate();
  }

  return value.slice(0, 10);
}

@Component({
  selector: 'admin-app-news-form-dialog',
  imports: [ReactiveFormsModule, Dialog, Button, InputText],
  templateUrl: './news-form-dialog.html',
  styleUrl: './news-form-dialog.scss',
})
export class NewsFormDialog {
  private readonly newsService = inject(NewsService);
  private readonly formBuilder = inject(FormBuilder);

  readonly visible = model(false);
  readonly item = input<NewsPublic | null>(null);

  readonly newsSaved = output<NewsPublic>();

  protected readonly submitting = signal(false);
  protected readonly isEditMode = computed(() => this.item() !== null);
  protected readonly dialogHeader = computed(() =>
    this.isEditMode() ? 'Edit News' : 'Create News',
  );

  protected readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.pattern(/\S+/), Validators.maxLength(255)]],
    description: [
      '',
      [Validators.required, Validators.pattern(/\S+/), Validators.maxLength(4000)],
    ],
    published_at: [todayIsoDate(), [Validators.required]],
  });

  constructor() {
    effect(() => {
      if (!this.visible()) {
        return;
      }

      const item = this.item();
      if (item) {
        this.form.patchValue({
          title: item.title,
          description: item.description,
          published_at: toIsoDate(item.published_at),
        });
      } else {
        this.resetForm();
      }
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

    const payload = {
      title: this.form.controls.title.value.trim(),
      description: this.form.controls.description.value.trim(),
      published_at: this.form.controls.published_at.value,
    };
    const item = this.item();
    this.submitting.set(true);

    const request$ = item
      ? this.newsService.update(item.id, payload)
      : this.newsService.create(payload);

    request$.subscribe({
      next: (saved) => {
        this.newsSaved.emit(saved);
        this.closeDialog();
        this.submitting.set(false);
      },
      error: () => this.submitting.set(false),
    });
  }

  private resetForm(): void {
    this.form.reset({
      title: '',
      description: '',
      published_at: todayIsoDate(),
    });
  }
}
