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
    { labelKey: 'marketing.nav.why', href: '#why' },
    { labelKey: 'marketing.nav.products', href: '#products' },
    { labelKey: 'marketing.nav.pricing', href: '#pricing' },
    { labelKey: 'marketing.nav.enterprise', href: '#enterprise' },
    { labelKey: 'marketing.nav.editions', href: '#editions' },
  ];
}
