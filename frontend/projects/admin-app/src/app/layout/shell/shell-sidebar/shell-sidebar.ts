import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { APP_NAV_ITEMS } from '../../../core/routing/app-nav-items';

@Component({
  selector: 'admin-app-shell-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './shell-sidebar.html',
  styleUrl: './shell-sidebar.scss',
  host: {
    class: 'shell-sidebar',
  },
})
export class ShellSidebar {
  protected readonly navItems = APP_NAV_ITEMS;
}
