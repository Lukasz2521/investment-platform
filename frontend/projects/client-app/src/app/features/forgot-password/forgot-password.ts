import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/services/auth.service';
import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { TranslationService } from '../../core/i18n/services/translation.service';
import { APP_ROUTE_PATHS } from '../../core/routing/app-route-paths';

@Component({
  selector: 'app-forgot-password',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  private readonly authService = inject(AuthService);
  private readonly translationService = inject(TranslationService);

  protected readonly routes = APP_ROUTE_PATHS;
  protected readonly email = signal('');
  protected readonly loading = signal(false);
  protected readonly submitted = signal(false);
  protected readonly apiError = signal<string | null>(null);

  protected onEmailInput(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();

    const email = this.email().trim();
    this.apiError.set(null);

    if (!email) {
      this.apiError.set(this.translationService.translate('marketing.forgotPassword.error.required'));
      return;
    }

    this.loading.set(true);

    this.authService.requestPasswordRecovery(email).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        const detail = error.error?.detail;
        this.apiError.set(
          typeof detail === 'string'
            ? detail
            : this.translationService.translate('marketing.forgotPassword.error.generic'),
        );
      },
    });
  }
}
