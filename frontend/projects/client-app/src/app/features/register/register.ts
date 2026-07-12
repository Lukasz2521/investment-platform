import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { APP_ROUTE_PATHS } from '../../core/routing/app-route-paths';
import {
  EMPTY_REGISTER_FORM,
  REGISTER_COUNTRIES,
  REGISTER_TIME_ZONES,
  RegisterForm,
} from './register-options';
import { getPasswordRequirements } from './register-password-rules';

@Component({
  selector: 'app-register',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  protected readonly routes = APP_ROUTE_PATHS;
  protected readonly countries = REGISTER_COUNTRIES;
  protected readonly timeZones = REGISTER_TIME_ZONES;
  protected readonly form = signal<RegisterForm>({ ...EMPTY_REGISTER_FORM });
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
  }
}
