import { Component, input, model, output } from '@angular/core';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';

import { NewsPublic } from '../../../core/news/models/news.model';

@Component({
  selector: 'admin-app-news-delete-dialog',
  imports: [Dialog, Button],
  templateUrl: './news-delete-dialog.html',
  styleUrl: './news-delete-dialog.scss',
})
export class NewsDeleteDialog {
  readonly visible = model(false);
  readonly item = input<NewsPublic | null>(null);
  readonly deleting = input(false);

  readonly confirm = output<void>();

  protected onCancel(): void {
    this.visible.set(false);
  }
}
