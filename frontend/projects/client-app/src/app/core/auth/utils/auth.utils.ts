export function getTokenExpiration(token: string): Date | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(normalized)) as { exp?: number };

    if (typeof decoded.exp !== 'number') {
      return null;
    }

    return new Date(decoded.exp * 1000);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string, skewSeconds = 0): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) {
    return true;
  }

  return Date.now() >= expiration.getTime() - skewSeconds * 1000;
}
