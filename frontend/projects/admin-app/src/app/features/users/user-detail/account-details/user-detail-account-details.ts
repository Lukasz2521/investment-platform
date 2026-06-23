import { Component, effect, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { ToggleSwitch } from 'primeng/toggleswitch';

import { AccountType, ACCOUNT_TYPE_OPTIONS } from '../../../../core/users/models/account-type.model';
import { AccountPublicForUser } from '../../../../core/users/models/user.model';

@Component({
  selector: 'admin-app-user-detail-account-details',
  imports: [FormsModule, Select, InputText, IconField, InputIcon, ToggleSwitch],
  templateUrl: './user-detail-account-details.html',
  styleUrl: './user-detail-account-details.scss',
})
export class UserDetailAccountDetails {
  readonly account = input<AccountPublicForUser | null>();

  protected readonly accountTypeOptions = [...ACCOUNT_TYPE_OPTIONS];

  protected accountType: AccountType | null = null;
  protected participationPercent = 0;
  protected customCampaigns = false;
  protected cardPayments = false;
}
