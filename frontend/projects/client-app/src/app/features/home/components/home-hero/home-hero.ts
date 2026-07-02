import { Component } from '@angular/core';

import { TranslatePipe } from '../../../../core/i18n/pipes/translate.pipe';

@Component({
  selector: 'app-home-hero',
  imports: [TranslatePipe],
  templateUrl: './home-hero.html',
  styleUrl: './home-hero.scss',
})
export class HomeHero {
  protected readonly heroPhrases = [
    'marketing.hero.phrase1',
    'marketing.hero.phrase2',
    'marketing.hero.phrase3',
    'marketing.hero.phrase4',
  ];
}
