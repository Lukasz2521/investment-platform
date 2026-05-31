import { UserPublic } from '../models/user.model';

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
