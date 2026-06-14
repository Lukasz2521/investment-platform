import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

import { environment } from '../../../../environments/environment';
import { AppRoutingService } from '../../routing/app-routing.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SessionTimeoutService {
  private readonly authService = inject(AuthService);
  private readonly appRouting = inject(AppRoutingService);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'] as const;
  private readonly boundReset = () => this.resetTimer();
  private readonly boundVisibilityChange = () => this.onVisibilityChange();

  private abortController: AbortController | null = null;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private lastActivityAt = Date.now();

  start(): void {
    if (!isPlatformBrowser(this.platformId) || !this.authService.isAuthenticated()) {
      return;
    }

    this.stop();
    this.lastActivityAt = Date.now();
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    for (const event of this.activityEvents) {
      document.addEventListener(event, this.boundReset, { passive: true, signal });
    }

    document.addEventListener('visibilitychange', this.boundVisibilityChange, { signal });
    this.resetTimer();
  }

  stop(): void {
    this.abortController?.abort();
    this.abortController = null;
    this.clearTimer();
  }

  private resetTimer(): void {
    if (!this.authService.isAuthenticated()) {
      this.expireSession();
      return;
    }

    this.lastActivityAt = Date.now();
    this.clearTimer();
    this.timeoutId = setTimeout(() => this.onTimeout(), this.getTimeoutMs());
  }

  private onVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      this.checkSession();
    }
  }

  private onTimeout(): void {
    this.expireSession();
  }

  private checkSession(): void {
    if (!this.authService.isAuthenticated()) {
      this.expireSession();
      return;
    }

    const elapsed = Date.now() - this.lastActivityAt;
    if (elapsed >= this.getTimeoutMs()) {
      this.expireSession();
      return;
    }

    this.clearTimer();
    this.timeoutId = setTimeout(() => this.onTimeout(), this.getTimeoutMs() - elapsed);
  }

  private expireSession(): void {
    this.stop();
    this.authService.logout();
    this.appRouting.navigateToLogin();
  }

  private clearTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private getTimeoutMs(): number {
    return environment.sessionInactivityTimeoutMinutes * 60 * 1000;
  }
}
