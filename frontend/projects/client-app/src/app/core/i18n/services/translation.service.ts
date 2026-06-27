import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import {
  DEFAULT_LANGUAGE,
  isLanguageCode,
  LANGUAGE_STORAGE_KEY,
  LanguageCode,
  SUPPORTED_LANGUAGES,
} from '../models/language.model';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  readonly activeLanguage = signal<LanguageCode>(DEFAULT_LANGUAGE);
  readonly translations = signal<Record<string, string>>({});

  readonly languages = SUPPORTED_LANGUAGES;

  private readonly loadedTranslations = new Map<LanguageCode, Record<string, string>>();

  async init(): Promise<void> {
    const language = this.resolveInitialLanguage();
    await this.setLanguage(language);
  }

  async setLanguage(language: LanguageCode): Promise<void> {
    const translations = await this.loadTranslations(language);

    this.activeLanguage.set(language);
    this.translations.set(translations);
    this.updateDocumentLanguage(language);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  }

  translate(key: string, params?: Record<string, string>): string {
    const template = this.translations()[key] ?? key;

    if (!params) {
      return template;
    }

    return Object.entries(params).reduce(
      (result, [name, value]) => result.replaceAll(`{{${name}}}`, value),
      template,
    );
  }

  private resolveInitialLanguage(): LanguageCode {
    if (!isPlatformBrowser(this.platformId)) {
      return DEFAULT_LANGUAGE;
    }

    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage && isLanguageCode(storedLanguage)) {
      return storedLanguage;
    }

    const browserLanguage = navigator.language.slice(0, 2);
    if (isLanguageCode(browserLanguage)) {
      return browserLanguage;
    }

    return DEFAULT_LANGUAGE;
  }

  private async loadTranslations(language: LanguageCode): Promise<Record<string, string>> {
    const cached = this.loadedTranslations.get(language);
    if (cached) {
      return cached;
    }

    const translations = await firstValueFrom(
      this.http.get<Record<string, string>>(`/i18n/${language}.json`),
    );

    this.loadedTranslations.set(language, translations);
    return translations;
  }

  private updateDocumentLanguage(language: LanguageCode): void {
    this.document.documentElement.lang = language;
  }
}
