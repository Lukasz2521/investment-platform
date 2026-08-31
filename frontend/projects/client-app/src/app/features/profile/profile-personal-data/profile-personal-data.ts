import {
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../../core/auth/services/auth.service';
import { UserPublic } from '../../../core/auth/models/user-public.model';
import { UserUpdateMePayload } from '../../../core/auth/models/user-update-me.model';
import { TranslatePipe } from '../../../core/i18n/pipes/translate.pipe';
import { TranslationService } from '../../../core/i18n/services/translation.service';
import {
  REGISTER_COUNTRIES,
  REGISTER_TIME_ZONES,
} from '../../register/register-options';

type PersonalDataForm = {
  name: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  timezone: string;
  postalCode: string;
  country: string;
  currency: string;
  marketingConsent: boolean;
};

const DEFAULT_CURRENCY = 'EUR';

function formFromUser(user: UserPublic): PersonalDataForm {
  return {
    name: user.name ?? '',
    lastName: user.last_name ?? '',
    phone: user.phone ?? '',
    email: user.email ?? '',
    address: user.address_line_one ?? '',
    city: user.city ?? '',
    timezone: user.timezone ?? '',
    postalCode: user.address_line_two ?? '',
    country: user.country ?? '',
    currency: DEFAULT_CURRENCY,
    marketingConsent: false,
  };
}

@Component({
  selector: 'app-profile-personal-data',
  imports: [TranslatePipe],
  templateUrl: './profile-personal-data.html',
  styleUrl: './profile-personal-data.scss',
})
export class ProfilePersonalData {
  private readonly authService = inject(AuthService);
  private readonly translationService = inject(TranslationService);

  readonly user = input.required<UserPublic>();
  readonly saved = output<UserPublic>();

  protected readonly form = linkedSignal(() => formFromUser(this.user()));
  protected readonly saving = signal(false);
  protected readonly success = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly countryOptions = computed(() => {
    const current = this.form().country.trim();
    if (current && !(REGISTER_COUNTRIES as readonly string[]).includes(current)) {
      return [current, ...REGISTER_COUNTRIES];
    }
    return REGISTER_COUNTRIES;
  });

  protected readonly timezoneOptions = computed(() => {
    const current = this.form().timezone.trim();
    if (current && !(REGISTER_TIME_ZONES as readonly string[]).includes(current)) {
      return [current, ...REGISTER_TIME_ZONES];
    }
    return REGISTER_TIME_ZONES;
  });

  protected updateField<K extends keyof PersonalDataForm>(key: K, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;

    this.form.update((current) => ({
      ...current,
      [key]: value,
    }));
    this.success.set(false);
    this.error.set(null);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (this.saving()) {
      return;
    }

    const form = this.form();
    const required = [
      form.name,
      form.lastName,
      form.address,
      form.city,
      form.timezone,
      form.postalCode,
      form.country,
    ];
    if (required.some((value) => !value.trim())) {
      this.error.set(this.translationService.translate('app.profile.personal.error.required'));
      return;
    }

    const payload: UserUpdateMePayload = {
      name: form.name.trim(),
      last_name: form.lastName.trim(),
      country: form.country.trim(),
      city: form.city.trim(),
      address_line_one: form.address.trim(),
      address_line_two: form.postalCode.trim(),
      timezone: form.timezone.trim(),
    };

    this.saving.set(true);
    this.error.set(null);

    this.authService.updateMe(payload).subscribe({
      next: (user) => {
        this.saving.set(false);
        this.success.set(true);
        this.saved.emit(user);
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.success.set(false);
        const detail = err.error?.detail;
        this.error.set(
          typeof detail === 'string'
            ? detail
            : this.translationService.translate('app.profile.personal.error.generic'),
        );
      },
    });
  }
}
