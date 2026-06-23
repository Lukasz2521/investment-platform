import { Component, input, model, output } from '@angular/core';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';

import { UserPublic } from '../../../../core/users/models/user.model';
import { getUserDisplayName } from '../../../../core/users/utils/user-display.utils';

@Component({
  selector: 'admin-app-user-detail-delete-dialog',
  imports: [Dialog, Button],
  templateUrl: './user-detail-delete-dialog.html',
  styleUrl: './user-detail-delete-dialog.scss',
})
export class UserDetailDeleteDialog {
  readonly visible = model(false);
  readonly user = input<UserPublic | null>(null);
  readonly deleting = input(false);

  readonly confirm = output<void>();

  protected displayName(user: UserPublic): string {
    return getUserDisplayName(user);
  }

  protected onCancel(): void {
    this.visible.set(false);
  }
}
