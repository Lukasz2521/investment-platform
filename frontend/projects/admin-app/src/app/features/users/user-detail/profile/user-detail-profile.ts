import { Component, computed, input } from '@angular/core';
import { Avatar } from 'primeng/avatar';

import { UserPublic } from '../../../../core/users/models/user.model';
import { getUserInitials, getUserRoleLabel } from '../../../../core/users/utils/user-display.utils';

@Component({
  selector: 'admin-app-user-detail-profile',
  imports: [Avatar],
  templateUrl: './user-detail-profile.html',
  styleUrl: './user-detail-profile.scss',
})
export class UserDetailProfile {
  readonly user = input.required<UserPublic>();

  protected readonly userInitials = computed(() => getUserInitials(this.user()));
  protected readonly userRoleLabel = computed(() => getUserRoleLabel(this.user()));

  protected displayValue(value: string | null | undefined): string {
    return value?.trim() ? value : '-';
  }
}
