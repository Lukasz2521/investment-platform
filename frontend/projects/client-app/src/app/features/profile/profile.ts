import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';

import { AuthService } from '../../core/auth/services/auth.service';
import { UserPublic } from '../../core/auth/models/user-public.model';
import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { TranslationService } from '../../core/i18n/services/translation.service';

function localeForLanguage(language: string): string {
  switch (language) {
    case 'pl':
      return 'pl-PL';
    case 'de':
      return 'de-DE';
    case 'fr':
      return 'fr-FR';
    case 'pt':
      return 'pt-PT';
    case 'ru':
      return 'ru-RU';
    default:
      return 'en-US';
  }
}

export type ProfileDocumentId =
  | 'idFront'
  | 'idBack'
  | 'addressProof'
  | 'creditCard'
  | 'iban'
  | 'fundsSource';

export type ProfileDocumentStatus = 'missing' | 'uploaded' | 'invalid';

export type ProfileDocumentDefinition = {
  id: ProfileDocumentId;
  titleKey: string;
  noteKey?: string;
  disabled?: boolean;
};

export type ProfileDocumentState = {
  status: ProfileDocumentStatus;
  fileName: string | null;
  previewUrl: string | null;
};

const PROFILE_DOCUMENTS: ProfileDocumentDefinition[] = [
  {
    id: 'idFront',
    titleKey: 'app.profile.documents.items.idFront',
  },
  {
    id: 'idBack',
    titleKey: 'app.profile.documents.items.idBack',
  },
  {
    id: 'addressProof',
    titleKey: 'app.profile.documents.items.addressProof',
    noteKey: 'app.profile.documents.items.addressProofNote',
  },
  {
    id: 'creditCard',
    titleKey: 'app.profile.documents.items.creditCard',
    disabled: true,
  },
  {
    id: 'iban',
    titleKey: 'app.profile.documents.items.iban',
  },
  {
    id: 'fundsSource',
    titleKey: 'app.profile.documents.items.fundsSource',
  },
];

const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const MAX_FILE_BYTES = 10 * 1024 * 1024;

function emptyDocumentState(): ProfileDocumentState {
  return { status: 'missing', fileName: null, previewUrl: null };
}

@Component({
  selector: 'app-profile',
  imports: [TranslatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly translationService = inject(TranslationService);

  protected readonly user = signal<UserPublic | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly closeConfirmOpen = signal(false);
  protected readonly closing = signal(false);
  protected readonly closeError = signal(false);

  protected readonly documentDefinitions = PROFILE_DOCUMENTS;
  protected readonly documentStates = signal<Record<ProfileDocumentId, ProfileDocumentState>>({
    idFront: emptyDocumentState(),
    idBack: emptyDocumentState(),
    addressProof: emptyDocumentState(),
    creditCard: emptyDocumentState(),
    iban: emptyDocumentState(),
    fundsSource: emptyDocumentState(),
  });

  protected readonly uploadDocId = signal<ProfileDocumentId | null>(null);
  protected readonly uploadError = signal(false);

  protected readonly isVerified = computed(() => this.user()?.is_verified === true);

  protected readonly uploadDoc = computed(() => {
    const id = this.uploadDocId();
    return id ? PROFILE_DOCUMENTS.find((doc) => doc.id === id) ?? null : null;
  });

  protected readonly uploadDocState = computed(() => {
    const id = this.uploadDocId();
    return id ? this.documentStates()[id] : null;
  });

  protected readonly avatarLabel = computed(() => {
    const login = (this.user()?.username || this.user()?.email || '').trim();
    if (!login) {
      return '?';
    }

    if (login.length <= 8) {
      return login;
    }

    return login.slice(0, 2).toUpperCase();
  });

  protected readonly memberSince = computed(() => {
    const createdAt = this.user()?.created_at;
    if (!createdAt) {
      return '—';
    }

    this.translationService.activeLanguage();
    const locale = localeForLanguage(this.translationService.activeLanguage());
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  });

  ngOnInit(): void {
    this.authService.getMe().subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: () => {
        this.user.set(null);
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  ngOnDestroy(): void {
    for (const state of Object.values(this.documentStates())) {
      if (state.previewUrl) {
        URL.revokeObjectURL(state.previewUrl);
      }
    }
  }

  protected documentState(id: ProfileDocumentId): ProfileDocumentState {
    return this.documentStates()[id];
  }

  protected openCloseConfirm(): void {
    if (this.isVerified() || this.closing()) {
      return;
    }

    this.closeError.set(false);
    this.closeConfirmOpen.set(true);
  }

  protected closeCloseConfirm(): void {
    if (this.closing()) {
      return;
    }

    this.closeConfirmOpen.set(false);
  }

  protected confirmCloseAccount(): void {
    if (this.isVerified() || this.closing()) {
      return;
    }

    this.closing.set(true);
    this.closeError.set(false);

    this.authService.deleteMe().subscribe({
      next: () => {
        this.closing.set(false);
        this.closeConfirmOpen.set(false);
        this.authService.forceLogout();
      },
      error: () => {
        this.closing.set(false);
        this.closeError.set(true);
      },
    });
  }

  protected openUploadDialog(doc: ProfileDocumentDefinition): void {
    if (doc.disabled) {
      return;
    }

    this.uploadError.set(false);
    this.uploadDocId.set(doc.id);
  }

  protected closeUploadDialog(): void {
    this.uploadDocId.set(null);
    this.uploadError.set(false);
  }

  protected onUploadFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    const docId = this.uploadDocId();
    input.value = '';

    if (!file || !docId) {
      return;
    }

    if (!ACCEPTED_TYPES.has(file.type) || file.size > MAX_FILE_BYTES) {
      this.setDocumentState(docId, {
        status: 'invalid',
        fileName: file.name,
        previewUrl: null,
      });
      this.uploadError.set(true);
      return;
    }

    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    this.setDocumentState(docId, {
      status: 'uploaded',
      fileName: file.name,
      previewUrl,
    });
    this.uploadError.set(false);
    this.uploadDocId.set(null);
  }

  protected clearUploadedDocument(): void {
    const docId = this.uploadDocId();
    if (!docId) {
      return;
    }

    this.setDocumentState(docId, emptyDocumentState());
    this.uploadError.set(false);
  }

  private setDocumentState(id: ProfileDocumentId, next: ProfileDocumentState): void {
    this.documentStates.update((current) => {
      const previous = current[id];
      if (previous.previewUrl && previous.previewUrl !== next.previewUrl) {
        URL.revokeObjectURL(previous.previewUrl);
      }

      return {
        ...current,
        [id]: next,
      };
    });
  }
}
