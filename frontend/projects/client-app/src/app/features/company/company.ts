import { Component } from '@angular/core';

import { CompanyFundamentalsSection } from './components/company-fundamentals/company-fundamentals';
import { CompanyHero } from './components/company-hero/company-hero';
import { CompanyTeam } from './components/company-team/company-team';
import { CompanyVision } from './components/company-vision/company-vision';

@Component({
  selector: 'app-company',
  imports: [CompanyHero, CompanyFundamentalsSection, CompanyVision, CompanyTeam],
  templateUrl: './company.html',
  styleUrl: './company.scss',
})
export class Company {}
