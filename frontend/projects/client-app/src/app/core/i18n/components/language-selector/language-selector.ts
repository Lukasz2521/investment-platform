import { Component, inject, input, signal } from '@angular/core';

import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageCode } from '../../models/language.model';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-language-selector',
  imports: [TranslatePipe],
  templateUrl: './language-selector.html',
  styleUrl: './language-selector.scss',
  host: {
    '[class.language-selector-host--compact]': 'variant() === "compact"',
  },
})
export class LanguageSelector {
  private readonly translationService = inject(TranslationService);

  readonly variant = input<'default' | 'compact'>('default');

  protected readonly languages = this.translationService.languages;
  protected readonly activeLanguage = this.translationService.activeLanguage;
  protected readonly menuOpen = signal(false);

  protected get activeFlag(): string {
    return (
      this.languages.find((language) => language.code === this.activeLanguage())?.flag ?? '🌐'
    );
  }

  protected onLanguageChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    if (!value) {
      return;
    }

    void this.translationService.setLanguage(value as LanguageCode);
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected selectLanguage(code: LanguageCode): void {
    this.menuOpen.set(false);
    void this.translationService.setLanguage(code);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
