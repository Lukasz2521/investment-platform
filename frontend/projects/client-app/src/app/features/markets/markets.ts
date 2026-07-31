import { Component } from '@angular/core';

import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';

@Component({
  selector: 'app-markets',
  imports: [TranslatePipe],
  templateUrl: './markets.html',
  styleUrl: './markets.scss',
})
export class Markets {}
