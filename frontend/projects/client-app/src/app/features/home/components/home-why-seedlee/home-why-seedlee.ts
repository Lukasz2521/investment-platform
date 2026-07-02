import { Component } from '@angular/core';

import { TranslatePipe } from '../../../../core/i18n/pipes/translate.pipe';
import { WHY_SEEDLEE_REASON_KEYS } from '../../why-seedlee-reasons';

@Component({
  selector: 'app-home-why-seedlee',
  imports: [TranslatePipe],
  templateUrl: './home-why-seedlee.html',
  styleUrl: './home-why-seedlee.scss',
})
export class HomeWhySeedlee {
  protected readonly reasons = WHY_SEEDLEE_REASON_KEYS;
}
