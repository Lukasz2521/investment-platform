import { Component, output } from '@angular/core';

import { TranslatePipe } from '../../../core/i18n/pipes/translate.pipe';

@Component({
  selector: 'app-campaign-launch-dialog',
  imports: [TranslatePipe],
  templateUrl: './campaign-launch-dialog.html',
  styleUrl: './campaign-launch-dialog.scss',
})
export class CampaignLaunchDialog {
  readonly closed = output<void>();
  readonly confirmed = output<void>();

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }

  protected onCancel(): void {
    this.closed.emit();
  }

  protected onConfirm(): void {
    this.confirmed.emit();
  }
}
