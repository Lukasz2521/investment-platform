import { Component } from '@angular/core';

import { TranslatePipe } from '../../../../core/i18n/pipes/translate.pipe';
import { HOW_IT_WORKS_STEPS } from '../../how-it-works-steps';

@Component({
  selector: 'app-home-how-it-works',
  imports: [TranslatePipe],
  templateUrl: './home-how-it-works.html',
  styleUrl: './home-how-it-works.scss',
})
export class HomeHowItWorks {
  protected readonly steps = HOW_IT_WORKS_STEPS;
}
