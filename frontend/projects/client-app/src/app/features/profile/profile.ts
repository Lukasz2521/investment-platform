import { Component, inject, OnInit, signal } from '@angular/core';

import { AuthService } from '../../core/auth/services/auth.service';
import { UserPublic } from '../../core/auth/models/user-public.model';
import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';

@Component({
  selector: 'app-profile',
  imports: [TranslatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private readonly authService = inject(AuthService);

  protected readonly user = signal<UserPublic | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  ngOnInit(): void {
    this.authService.getMe().subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: () => {
        this.user.set(null);
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }
}
