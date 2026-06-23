import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { afterNextRender, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

const STORAGE_KEY = 'admin-app-dark-mode';
const DARK_MODE_CLASS = 'app-dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  readonly darkMode = signal(this.readStored());

  constructor() {
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.apply(this.darkMode());
      }
    });
  }

  toggle(): void {
    this.darkMode.update((enabled) => !enabled);
    this.persist(this.darkMode());
    this.apply(this.darkMode());
  }

  private readStored(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }

    return localStorage.getItem(STORAGE_KEY) === 'true';
  }

  private persist(enabled: boolean): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    }
  }

  private apply(enabled: boolean): void {
    this.document.documentElement.classList.toggle(DARK_MODE_CLASS, enabled);
  }
}
