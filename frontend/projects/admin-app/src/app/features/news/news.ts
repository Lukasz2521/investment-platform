import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Toolbar } from 'primeng/toolbar';

import { NewsPublic } from '../../core/news/models/news.model';
import { NewsService } from '../../core/news/services/news.service';
import { NewsDeleteDialog } from './news-delete-dialog/news-delete-dialog';
import { NewsFormDialog } from './news-form-dialog/news-form-dialog';
import { NewsTable } from './news-table/news-table';

@Component({
  selector: 'admin-app-news',
  imports: [Toolbar, Card, Button, NewsFormDialog, NewsDeleteDialog, NewsTable],
  templateUrl: './news.html',
  styleUrl: './news.scss',
})
export class News {
  private readonly newsService = inject(NewsService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly loading = signal(true);
  protected readonly items = signal<NewsPublic[]>([]);
  protected readonly formDialogVisible = signal(false);
  protected readonly itemToEdit = signal<NewsPublic | null>(null);
  protected readonly deleteDialogVisible = signal(false);
  protected readonly itemToDelete = signal<NewsPublic | null>(null);
  protected readonly deleting = signal(false);

  constructor() {
    effect(() => {
      if (!this.formDialogVisible()) {
        this.itemToEdit.set(null);
      }
    });

    effect(() => {
      if (!this.deleteDialogVisible()) {
        this.itemToDelete.set(null);
      }
    });

    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        this.loading.set(false);
        return;
      }

      this.loadNews();
    });
  }

  private loadNews(showLoading = false): void {
    if (showLoading) {
      this.loading.set(true);
    }

    this.newsService.getAll().subscribe({
      next: ({ data }) => {
        this.items.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected openAddDialog(): void {
    this.itemToEdit.set(null);
    this.formDialogVisible.set(true);
  }

  protected openEditDialog(item: NewsPublic): void {
    this.itemToEdit.set(item);
    this.formDialogVisible.set(true);
  }

  protected onNewsSaved(): void {
    this.loadNews(true);
  }

  protected openDeleteDialog(item: NewsPublic): void {
    this.itemToDelete.set(item);
    this.deleteDialogVisible.set(true);
  }

  protected confirmDelete(): void {
    const item = this.itemToDelete();
    if (!item || this.deleting()) {
      return;
    }

    this.deleting.set(true);
    this.newsService.delete(item.id).subscribe({
      next: () => {
        this.deleteDialogVisible.set(false);
        this.deleting.set(false);
        this.loadNews(true);
      },
      error: () => this.deleting.set(false),
    });
  }
}
