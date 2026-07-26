import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';

import { AuthService } from '../../core/auth/services/auth.service';
import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { TranslationService } from '../../core/i18n/services/translation.service';
import {
  getPasswordRequirements,
  isPasswordValid,
} from '../register/register-password-rules';

@Component({
  selector: 'app-change-password',
  imports: [TranslatePipe],
  templateUrl: './change-password.html',
  styleUrl: './change-password.scss',
})
export class ChangePassword {
  private readonly authService = inject(AuthService);
  private readonly translationService = inject(TranslationService);

  protected readonly currentPassword = signal('');
  protected readonly newPassword = signal('');
  protected readonly confirmPassword = signal('');
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal(false);

  protected readonly securityInfoKeys = [
    'app.changePassword.security.logout',
    'app.changePassword.security.unique',
    'app.changePassword.security.share',
    'app.changePassword.security.suspicious',
    'app.changePassword.security.recovery',
  ] as const;

  protected readonly passwordRequirements = computed(() =>
    getPasswordRequirements(this.newPassword()),
  );

  protected readonly canSubmit = computed(() => {
    const current = this.currentPassword();
    const next = this.newPassword();
    const confirm = this.confirmPassword();

    return (
      !this.submitting() &&
      current.length >= 8 &&
      isPasswordValid(next) &&
      next === confirm
    );
  });

  protected onCurrentPasswordInput(event: Event): void {
    this.currentPassword.set((event.target as HTMLInputElement).value);
    this.clearFeedback();
  }

  protected onNewPasswordInput(event: Event): void {
    this.newPassword.set((event.target as HTMLInputElement).value);
    this.clearFeedback();
  }

  protected onConfirmPasswordInput(event: Event): void {
    this.confirmPassword.set((event.target as HTMLInputElement).value);
    this.clearFeedback();
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();

    if (!this.canSubmit()) {
      if (this.newPassword() !== this.confirmPassword()) {
        this.error.set(
          this.translationService.translate('app.changePassword.error.mismatch'),
        );
      }
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    this.success.set(false);

    this.authService
      .updatePassword(this.currentPassword(), this.newPassword())
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.success.set(true);
          this.currentPassword.set('');
          this.newPassword.set('');
          this.confirmPassword.set('');
        },
        error: (error: HttpErrorResponse) => {
          this.submitting.set(false);
          const detail = error.error?.detail;
          this.error.set(
            typeof detail === 'string'
              ? detail
              : this.translationService.translate('app.changePassword.error.generic'),
          );
        },
      });
  }

  private clearFeedback(): void {
    this.error.set(null);
    this.success.set(false);
  }
}
