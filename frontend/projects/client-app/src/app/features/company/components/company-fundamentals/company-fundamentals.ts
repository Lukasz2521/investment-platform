import { Component } from '@angular/core';

import { TranslatePipe } from '../../../../core/i18n/pipes/translate.pipe';
import { COMPANY_FUNDAMENTALS } from '../../company-fundamentals';

@Component({
  selector: 'app-company-fundamentals',
  imports: [TranslatePipe],
  templateUrl: './company-fundamentals.html',
  styleUrl: './company-fundamentals.scss',
})
export class CompanyFundamentalsSection {
  protected readonly fundamentals = COMPANY_FUNDAMENTALS;
}
