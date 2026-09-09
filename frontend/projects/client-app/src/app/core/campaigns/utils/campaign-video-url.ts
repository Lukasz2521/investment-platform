import { environment } from '../../../../environments/environment';

const CAMPAIGN_VIDEOS_DIR = `${environment.apiUrl}/uploads/campaigns`;

export function campaignVideoFilename(stored: string | null | undefined): string {
  if (!stored) {
    return '';
  }

  const filename = stored.trim();
  if (
    !filename ||
    filename.includes('://') ||
    filename.includes('/') ||
    filename.includes('\\') ||
    filename.startsWith('.') ||
    !filename.toLowerCase().endsWith('.mp4')
  ) {
    return '';
  }

  return filename;
}

export function campaignVideoUrl(stored: string | null | undefined): string | null {
  const filename = campaignVideoFilename(stored);
  if (!filename) {
    return null;
  }

  return `${CAMPAIGN_VIDEOS_DIR}/${filename}`;
}
