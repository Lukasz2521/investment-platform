import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { APP_ROUTE_PATHS } from '../../core/routing/app-route-paths';

@Component({
  selector: 'app-login',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  protected readonly routes = APP_ROUTE_PATHS;
  protected readonly username = signal('');
  protected readonly password = signal('');

  protected onUsernameInput(event: Event): void {
    this.username.set((event.target as HTMLInputElement).value);
  }

  protected onPasswordInput(event: Event): void {
    this.password.set((event.target as HTMLInputElement).value);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
  }
}
