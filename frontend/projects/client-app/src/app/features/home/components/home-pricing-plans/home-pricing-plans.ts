import { Component } from '@angular/core';

import { TranslatePipe } from '../../../../core/i18n/pipes/translate.pipe';
import { PRICING_PLANS } from '../../pricing-plans';

@Component({
  selector: 'app-home-pricing-plans',
  imports: [TranslatePipe],
  templateUrl: './home-pricing-plans.html',
  styleUrl: './home-pricing-plans.scss',
})
export class HomePricingPlans {
  protected readonly plans = PRICING_PLANS;
}
