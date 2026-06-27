import { Component, inject } from '@angular/core';

import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageCode } from '../../models/language.model';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-language-selector',
  imports: [TranslatePipe],
  templateUrl: './language-selector.html',
  styleUrl: './language-selector.scss',
})
export class LanguageSelector {
  private readonly translationService = inject(TranslationService);

  protected readonly languages = this.translationService.languages;
  protected readonly activeLanguage = this.translationService.activeLanguage;

  protected onLanguageChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    if (!value) {
      return;
    }

    void this.translationService.setLanguage(value as LanguageCode);
  }
}
