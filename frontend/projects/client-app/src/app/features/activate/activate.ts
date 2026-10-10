import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/services/auth.service';
import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { TranslationService } from '../../core/i18n/services/translation.service';
import { APP_ROUTE_PATHS } from '../../core/routing/app-route-paths';

@Component({
  selector: 'app-activate',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './activate.html',
  styleUrl: '../reset-password/reset-password.scss',
})
export class Activate implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly translationService = inject(TranslationService);

  protected readonly routes = APP_ROUTE_PATHS;
  protected readonly loading = signal(true);
  protected readonly success = signal(false);
  protected readonly message = signal<string | null>(null);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token')?.trim() ?? '';

    if (!token) {
      this.loading.set(false);
      this.message.set(this.translationService.translate('marketing.activate.error.invalid'));
      return;
    }

    this.authService.activateAccount(token).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.success.set(true);
        this.message.set(
          response.message === 'Account is already active'
            ? this.translationService.translate('marketing.activate.alreadyActive')
            : this.translationService.translate('marketing.activate.success'),
        );
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        const detail = error.error?.detail;
        this.message.set(
          detail === 'Invalid or expired activation token' || detail === 'User not found'
            ? this.translationService.translate('marketing.activate.error.invalid')
            : this.translationService.translate('marketing.activate.error.generic'),
        );
      },
    });
  }
}
