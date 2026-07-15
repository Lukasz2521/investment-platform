import { Component, signal } from '@angular/core';

import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { ContactForm, EMPTY_CONTACT_FORM } from './contact-options';

@Component({
  selector: 'app-contact',
  imports: [TranslatePipe],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  protected readonly form = signal<ContactForm>({ ...EMPTY_CONTACT_FORM });

  protected updateField<K extends keyof ContactForm>(key: K, event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    this.form.update((current) => ({
      ...current,
      [key]: value,
    }));
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
  }
}
