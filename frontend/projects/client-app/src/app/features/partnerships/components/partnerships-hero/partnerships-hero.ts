import { Component } from '@angular/core';

import { TranslatePipe } from '../../../../core/i18n/pipes/translate.pipe';

@Component({
  selector: 'app-partnerships-hero',
  imports: [TranslatePipe],
  templateUrl: './partnerships-hero.html',
  styleUrl: './partnerships-hero.scss',
})
export class PartnershipsHero {}
