import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/services/auth.service';
import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { TranslationService } from '../../core/i18n/services/translation.service';
import { APP_ROUTE_PATHS } from '../../core/routing/app-route-paths';

@Component({
  selector: 'app-login',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translationService = inject(TranslationService);

  protected readonly routes = APP_ROUTE_PATHS;
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly loading = signal(false);
  protected readonly apiError = signal<string | null>(null);
  protected readonly registrationSuccess = signal(
    this.route.snapshot.queryParamMap.get('registered') === '1',
  );

  protected onEmailInput(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
  }

  protected onPasswordInput(event: Event): void {
    this.password.set((event.target as HTMLInputElement).value);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();

    const email = this.email().trim();
    const password = this.password();

    this.apiError.set(null);

    if (!email || !password) {
      this.apiError.set(this.translationService.translate('marketing.login.error.required'));
      return;
    }

    this.loading.set(true);

    this.authService.login(email, password).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigate(['/', this.routes.dashboard]);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        const detail = error.error?.detail;
        this.apiError.set(
          typeof detail === 'string'
            ? detail
            : this.translationService.translate('marketing.login.error.generic'),
        );
      },
    });
  }
}
