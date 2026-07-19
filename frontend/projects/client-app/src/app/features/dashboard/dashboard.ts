import { Component } from '@angular/core';

import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [TranslatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {}
