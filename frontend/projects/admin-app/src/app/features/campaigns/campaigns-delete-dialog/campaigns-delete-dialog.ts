import { Component, input, model, output } from '@angular/core';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';

import { CampaignPublic } from '../../../core/campaigns/models/campaign.model';

@Component({
  selector: 'admin-app-campaigns-delete-dialog',
  imports: [Dialog, Button],
  templateUrl: './campaigns-delete-dialog.html',
  styleUrl: './campaigns-delete-dialog.scss',
})
export class CampaignsDeleteDialog {
  readonly visible = model(false);
  readonly campaign = input<CampaignPublic | null>(null);
  readonly deleting = input(false);

  readonly confirm = output<void>();

  protected onCancel(): void {
    this.visible.set(false);
  }
}
