import { environment } from '../../../../environments/environment';

const BANK_LOGOS_DIR = `${environment.apiUrl}/uploads/banks`;

export function bankLogoUrl(filename: string | null | undefined): string | null {
  if (!filename) {
    return null;
  }

  if (
    filename.startsWith('http://') ||
    filename.startsWith('https://') ||
    filename.startsWith('/')
  ) {
    return filename;
  }

  return `${BANK_LOGOS_DIR}/${filename}`;
}
