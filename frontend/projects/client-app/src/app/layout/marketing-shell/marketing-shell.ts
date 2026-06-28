import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { LanguageSelector } from '../../core/i18n/components/language-selector/language-selector';
import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { APP_ROUTE_PATHS } from '../../core/routing/app-route-paths';

@Component({
  selector: 'app-marketing-shell',
  imports: [RouterOutlet, RouterLink, TranslatePipe, LanguageSelector],
  templateUrl: './marketing-shell.html',
  styleUrl: './marketing-shell.scss',
})
export class MarketingShell {
  protected readonly routes = APP_ROUTE_PATHS;

  protected readonly navItems = [
    { labelKey: 'marketing.nav.contact', href: '#contact' },
    { labelKey: 'marketing.nav.company', href: '#company' },
    { labelKey: 'marketing.nav.partnerships', href: '#partnerships' },
    { labelKey: 'marketing.nav.news', href: '#news' },
  ];
}
