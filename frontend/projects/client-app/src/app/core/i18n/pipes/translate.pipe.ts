import { Pipe, PipeTransform, inject } from '@angular/core';

import { TranslationService } from '../services/translation.service';

@Pipe({
  name: 'translate',
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly translationService = inject(TranslationService);

  transform(key: string, params?: Record<string, string>): string {
    this.translationService.activeLanguage();
    return this.translationService.translate(key, params);
  }
}
