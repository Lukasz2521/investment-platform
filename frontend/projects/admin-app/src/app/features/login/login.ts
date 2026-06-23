import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';

import { AuthService } from '../../core/auth/services/auth.service';
import { AppRoutingService } from '../../core/routing/app-routing.service';

@Component({
  selector: 'admin-app-login',
  imports: [ReactiveFormsModule, InputText, Password, Button, Message],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly appRouting = inject(AppRoutingService);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.getRawValue();

    this.authService.login(email, password)
    .subscribe({
      next: () => {
        this.loading.set(false);
        this.appRouting.navigateToDashboard();
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        const detail = error.error?.detail;
        this.errorMessage.set(
          typeof detail === 'string' ? detail : 'Incorrect email or password',
        );
      },
    });
  }
}
