import { DatePipe, isPlatformBrowser } from '@angular/common';
import {
  Component,
  effect,
  inject,
  input,
  OnDestroy,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';

import { AdminUserDocumentPublic } from '../../../../core/users/models/user-document.model';
import { UserDocumentsService } from '../../../../core/users/services/user-documents.service';

const DOCUMENT_LABELS: Record<string, string> = {
  id_front: 'ID front',
  id_back: 'ID back',
  address_proof: 'Address proof',
  iban: 'IBAN',
  funds_source: 'Source of funds',
};

type UserDocumentRow = {
  document_type: string;
  label: string;
  filename: string;
  content_type: string;
  created_at: string | null;
};

type PreviewKind = 'image' | 'pdf' | 'file';

@Component({
  selector: 'admin-app-user-detail-documents',
  imports: [DatePipe, TableModule, IconField, InputIcon, InputText, Button, Dialog],
  templateUrl: './user-detail-documents.html',
  styleUrl: './user-detail-documents.scss',
})
export class UserDetailDocuments implements OnDestroy {
  private readonly documentsService = inject(UserDocumentsService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly documentsTable = viewChild<Table>('documentsTable');
  private previewRequest = 0;
  private previewObjectUrl: string | null = null;
  private lastLoadAt = 0;

  readonly userId = input.required<string>();
  readonly tabActive = input(false);

  protected readonly loading = signal(true);
  protected readonly documents = signal<UserDocumentRow[]>([]);
  protected readonly previewVisible = signal(false);
  protected readonly previewLoading = signal(false);
  protected readonly previewError = signal(false);
  protected readonly previewTitle = signal('');
  protected readonly previewKind = signal<PreviewKind>('file');
  protected readonly previewUrl = signal<SafeUrl | null>(null);
  protected readonly previewSrc = signal<SafeResourceUrl | null>(null);

  constructor() {
    effect((onCleanup) => {
      if (!isPlatformBrowser(this.platformId) || !this.tabActive()) {
        return;
      }

      const userId = this.userId();
      if (!userId) {
        this.loading.set(false);
        return;
      }

      this.loadDocuments(userId);

      const refresh = (): void => {
        if (document.visibilityState === 'visible') {
          this.loadDocuments(userId);
        }
      };
      window.addEventListener('focus', refresh);
      document.addEventListener('visibilitychange', refresh);
      onCleanup(() => {
        window.removeEventListener('focus', refresh);
        document.removeEventListener('visibilitychange', refresh);
      });
    });
  }

  ngOnDestroy(): void {
    this.clearPreview();
  }

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.documentsTable()?.filterGlobal(value, 'contains');
  }

  protected openPreview(document: UserDocumentRow): void {
    this.clearPreview();
    const requestId = ++this.previewRequest;
    this.previewVisible.set(true);
    this.previewLoading.set(true);
    this.previewTitle.set(document.label);
    this.previewKind.set(this.kindFor(document.content_type));

    this.documentsService.getFile(this.userId(), document.document_type).subscribe({
      next: (blob) => {
        if (requestId !== this.previewRequest) {
          return;
        }

        const url = URL.createObjectURL(blob);
        this.previewObjectUrl = url;
        this.previewUrl.set(this.sanitizer.bypassSecurityTrustUrl(url));
        this.previewSrc.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        this.previewLoading.set(false);
      },
      error: () => {
        if (requestId !== this.previewRequest) {
          return;
        }

        this.previewError.set(true);
        this.previewLoading.set(false);
      },
    });
  }

  protected onPreviewVisibleChange(visible: boolean): void {
    this.previewVisible.set(visible);
    if (!visible) {
      this.clearPreview();
    }
  }

  private loadDocuments(userId: string): void {
    const now = Date.now();
    if (now - this.lastLoadAt < 250) {
      return;
    }
    this.lastLoadAt = now;
    this.loading.set(true);

    this.documentsService.getByUserId(userId).subscribe({
      next: ({ data }) => {
        this.documents.set(data.map((document) => this.toRow(document)));
        this.loading.set(false);
      },
      error: () => {
        this.documents.set([]);
        this.loading.set(false);
      },
    });
  }

  private toRow(document: AdminUserDocumentPublic): UserDocumentRow {
    return {
      document_type: document.document_type,
      label: DOCUMENT_LABELS[document.document_type] ?? document.document_type,
      filename: document.filename,
      content_type: document.content_type,
      created_at: document.created_at,
    };
  }

  private kindFor(contentType: string): PreviewKind {
    if (contentType.startsWith('image/')) {
      return 'image';
    }

    if (contentType === 'application/pdf') {
      return 'pdf';
    }

    return 'file';
  }

  private clearPreview(): void {
    this.previewRequest += 1;
    this.previewLoading.set(false);
    this.previewError.set(false);
    this.previewUrl.set(null);
    this.previewSrc.set(null);
    if (this.previewObjectUrl) {
      URL.revokeObjectURL(this.previewObjectUrl);
      this.previewObjectUrl = null;
    }
  }
}
