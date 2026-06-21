import { Component, input, model, output } from '@angular/core';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { UserPublic } from '../../../../core/users/models/user.model';
import { getUserDisplayName } from '../../../../core/users/utils/user-display.utils';


@Component({
  selector: 'admin-app-user-detail-make-admin-dialog',
  imports: [Dialog, Button],
  templateUrl: './user-detail-make-admin-dialog.html',
  styleUrl: './user-detail-make-admin-dialog.scss',
})
export class UserDetailMakeAdminDialog {
  readonly visible = model(false);
  readonly user = input<UserPublic | null>(null);
  readonly submitting = input(false);

  readonly confirm = output<void>();

  protected displayName(user: UserPublic): string {
    return getUserDisplayName(user);
  }

  protected onCancel(): void {
    this.visible.set(false);
  }
}
