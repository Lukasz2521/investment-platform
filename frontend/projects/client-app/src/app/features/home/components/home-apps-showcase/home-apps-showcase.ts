import { Component } from '@angular/core';

import { TranslatePipe } from '../../../../core/i18n/pipes/translate.pipe';
import { APP_SHOWCASE_BRANDS } from '../../app-showcase-brands';

@Component({
  selector: 'app-home-apps-showcase',
  imports: [TranslatePipe],
  templateUrl: './home-apps-showcase.html',
  styleUrl: './home-apps-showcase.scss',
})
export class HomeAppsShowcase {
  protected readonly brands = APP_SHOWCASE_BRANDS;

  protected onMouseMove(event: MouseEvent): void {
    const section = event.currentTarget as HTMLElement;
    const rect = section.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    section.style.setProperty('--spotlight-x', `${x}px`);
    section.style.setProperty('--spotlight-y', `${y}px`);
    section.style.setProperty('--spotlight-opacity', '1');
  }

  protected onMouseLeave(event: MouseEvent): void {
    const section = event.currentTarget as HTMLElement;
    section.style.setProperty('--spotlight-opacity', '0');
  }
}
