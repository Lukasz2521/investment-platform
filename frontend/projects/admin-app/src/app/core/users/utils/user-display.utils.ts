import { ACCOUNT_TYPE_OPTIONS } from '../models/account-type.model';
import { UserPublic } from '../models/user.model';

const ACCOUNT_TYPE_LABELS = Object.fromEntries(
  ACCOUNT_TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<string, string>;

export function getUserDisplayName(user: UserPublic | null): string {
  if (!user) {
    return '';
  }

  const fullName = [user.name, user.last_name]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' ');

  if (fullName) {
    return fullName;
  }

  return user.full_name?.trim() || user.email;
}

export function getUserInitials(user: UserPublic | null): string {
  const displayName = getUserDisplayName(user);

  if (!displayName) {
    return '?';
  }

  return displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function getUserRoleLabel(user: UserPublic | null): string {
  if (!user) {
    return '';
  }

  return user.is_superuser ? 'admin' : 'user';
}

export function getUserAccountTypeLabel(user: UserPublic | null): string {
  const accountType = user?.account?.account_type;

  if (!accountType) {
    return '-';
  }

  return ACCOUNT_TYPE_LABELS[accountType] ?? accountType;
}
