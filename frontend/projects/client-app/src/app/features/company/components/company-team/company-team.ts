import { Component } from '@angular/core';

import { TranslatePipe } from '../../../../core/i18n/pipes/translate.pipe';
import { COMPANY_MEMBERS } from '../../company-members';

@Component({
  selector: 'app-company-team',
  imports: [TranslatePipe],
  templateUrl: './company-team.html',
  styleUrl: './company-team.scss',
})
export class CompanyTeam {
  protected readonly members = COMPANY_MEMBERS;
}
