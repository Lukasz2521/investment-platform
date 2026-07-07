import { Component } from '@angular/core';

import { PartnershipsGrid } from './components/partnerships-grid/partnerships-grid';
import { PartnershipsHero } from './components/partnerships-hero/partnerships-hero';

@Component({
  selector: 'app-partnerships',
  imports: [PartnershipsHero, PartnershipsGrid],
  templateUrl: './partnerships.html',
  styleUrl: './partnerships.scss',
})
export class Partnerships {}
