import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/services/auth.service';
import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { TranslationService } from '../../core/i18n/services/translation.service';
import { APP_ROUTE_PATHS } from '../../core/routing/app-route-paths';
import {
  getPasswordRequirements,
  isPasswordValid,
} from '../register/register-password-rules';

@Component({
  selector: 'app-reset-password',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly translationService = inject(TranslationService);

  protected readonly routes = APP_ROUTE_PATHS;
  protected readonly token = signal('');
  protected readonly password = signal('');
  protected readonly confirmPassword = signal('');
  protected readonly showPassword = signal(false);
  protected readonly loading = signal(false);
  protected readonly success = signal(false);
  protected readonly apiError = signal<string | null>(null);
  protected readonly missingToken = signal(false);

  protected readonly passwordRequirements = computed(() =>
    getPasswordRequirements(this.password()),
  );

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token')?.trim() ?? '';
    this.token.set(token);
    this.missingToken.set(!token);
  }

  protected onPasswordInput(event: Event): void {
    this.password.set((event.target as HTMLInputElement).value);
  }

  protected onConfirmPasswordInput(event: Event): void {
    this.confirmPassword.set((event.target as HTMLInputElement).value);
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update((visible) => !visible);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();

    const token = this.token();
    const password = this.password();
    const confirmPassword = this.confirmPassword();

    this.apiError.set(null);

    if (!token) {
      this.missingToken.set(true);
      return;
    }

    if (!isPasswordValid(password)) {
      this.apiError.set(
        this.translationService.translate('marketing.register.error.passwordInvalid'),
      );
      return;
    }

    if (password !== confirmPassword) {
      this.apiError.set(
        this.translationService.translate('marketing.register.error.passwordMismatch'),
      );
      return;
    }

    this.loading.set(true);

    this.authService.resetPassword(token, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        const detail = error.error?.detail;
        this.apiError.set(
          typeof detail === 'string'
            ? detail
            : this.translationService.translate('marketing.resetPassword.error.generic'),
        );
      },
    });
  }
}
