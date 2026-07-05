import { Component } from '@angular/core';

import { TranslatePipe } from '../../../../core/i18n/pipes/translate.pipe';

@Component({
  selector: 'app-company-hero',
  imports: [TranslatePipe],
  templateUrl: './company-hero.html',
  styleUrl: './company-hero.scss',
})
export class CompanyHero {}
