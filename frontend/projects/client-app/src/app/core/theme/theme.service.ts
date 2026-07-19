import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  computed,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from '@angular/core';

export type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'client-app-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  readonly mode = signal<ThemeMode>(this.readStored());
  readonly isDark = computed(() => this.mode() === 'dark');

  constructor() {
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.apply(this.mode());
      }
    });
  }

  toggle(): void {
    const next: ThemeMode = this.mode() === 'dark' ? 'light' : 'dark';
    this.mode.set(next);
    this.persist(next);
    this.apply(next);
  }

  private readStored(): ThemeMode {
    if (typeof localStorage === 'undefined') {
      return 'dark';
    }

    return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
  }

  private persist(mode: ThemeMode): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  }

  private apply(mode: ThemeMode): void {
    this.document.documentElement.classList.toggle('client-app-light', mode === 'light');
  }
}
