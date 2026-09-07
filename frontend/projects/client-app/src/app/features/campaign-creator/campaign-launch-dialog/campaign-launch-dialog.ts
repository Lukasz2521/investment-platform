import { Component, input, output } from '@angular/core';

import { TranslatePipe } from '../../../core/i18n/pipes/translate.pipe';

@Component({
  selector: 'app-campaign-launch-dialog',
  imports: [TranslatePipe],
  templateUrl: './campaign-launch-dialog.html',
  styleUrl: './campaign-launch-dialog.scss',
})
export class CampaignLaunchDialog {
  readonly busy = input(false);
  readonly error = input<string | null>(null);
  readonly closed = output<void>();
  readonly confirmed = output<void>();

  protected onBackdropClick(event: MouseEvent): void {
    if (this.busy() || event.target !== event.currentTarget) {
      return;
    }

    this.closed.emit();
  }

  protected onCancel(): void {
    if (this.busy()) {
      return;
    }

    this.closed.emit();
  }

  protected onConfirm(): void {
    if (this.busy()) {
      return;
    }

    this.confirmed.emit();
  }
}
