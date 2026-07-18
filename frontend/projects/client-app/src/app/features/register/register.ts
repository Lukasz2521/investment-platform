import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/services/auth.service';
import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { TranslationService } from '../../core/i18n/services/translation.service';
import { APP_ROUTE_PATHS } from '../../core/routing/app-route-paths';
import {
  EMPTY_REGISTER_FORM,
  getRegisterValidationError,
  REGISTER_COUNTRIES,
  REGISTER_TIME_ZONES,
  RegisterForm,
  RegisterValidationError,
  toUserRegisterPayload,
} from './register-options';
import { getPasswordRequirements } from './register-password-rules';

@Component({
  selector: 'app-register',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly translationService = inject(TranslationService);

  protected readonly routes = APP_ROUTE_PATHS;
  protected readonly countries = REGISTER_COUNTRIES;
  protected readonly timeZones = REGISTER_TIME_ZONES;
  protected readonly form = signal<RegisterForm>({ ...EMPTY_REGISTER_FORM });
  protected readonly loading = signal(false);
  protected readonly validationError = signal<RegisterValidationError | null>(null);
  protected readonly apiError = signal<string | null>(null);
  protected readonly passwordRequirements = computed(() =>
    getPasswordRequirements(this.form().password),
  );

  protected updateField<K extends keyof RegisterForm>(key: K, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    this.form.update((current) => ({
      ...current,
      [key]: value,
    }));
  }

  protected toggleCheckbox(key: 'acceptTerms' | 'marketingConsent', event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    this.form.update((current) => ({
      ...current,
      [key]: checked,
    }));
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();

    const form = this.form();
    const validationError = getRegisterValidationError(form);

    this.validationError.set(validationError);
    this.apiError.set(null);

    if (validationError) {
      return;
    }

    this.loading.set(true);

    this.authService.register(toUserRegisterPayload(form)).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigate(['/', this.routes.login], {
          queryParams: { registered: '1' },
        });
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        const detail = error.error?.detail;
        this.apiError.set(
          typeof detail === 'string'
            ? detail
            : this.translationService.translate('marketing.register.error.generic'),
        );
      },
    });
  }
}
