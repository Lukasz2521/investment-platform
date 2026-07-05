import { Component } from '@angular/core';

import { TranslatePipe } from '../../../../core/i18n/pipes/translate.pipe';

@Component({
  selector: 'app-company-vision',
  imports: [TranslatePipe],
  templateUrl: './company-vision.html',
  styleUrl: './company-vision.scss',
})
export class CompanyVision {}
