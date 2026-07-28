export type CampaignGuidelinesForm = {
  male: boolean;
  female: boolean;
  startDate: string;
  endDate: string;
  budget: string;
  ageMin: number;
  ageMax: number;
};

export const CAMPAIGN_GUIDELINES_MIN_BUDGET = 200;
export const CAMPAIGN_GUIDELINES_MIN_DAYS = 3;
export const CAMPAIGN_GUIDELINES_MAX_DAYS = 180;
export const CAMPAIGN_GUIDELINES_AGE_MIN = 0;
export const CAMPAIGN_GUIDELINES_AGE_MAX = 100;

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function createDefaultCampaignGuidelinesForm(): CampaignGuidelinesForm {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    male: false,
    female: false,
    startDate: toDateInputValue(today),
    endDate: toDateInputValue(addDays(today, 14)),
    budget: '482',
    ageMin: 0,
    ageMax: 100,
  };
}

export function campaignGuidelinesDurationDays(
  startDate: string,
  endDate: string,
): number | null {
  if (!startDate || !endDate) {
    return null;
  }

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  return diff;
}

export function isCampaignGuidelinesValid(form: CampaignGuidelinesForm): boolean {
  if (!form.male && !form.female) {
    return false;
  }

  const days = campaignGuidelinesDurationDays(form.startDate, form.endDate);
  if (
    days === null ||
    days < CAMPAIGN_GUIDELINES_MIN_DAYS ||
    days > CAMPAIGN_GUIDELINES_MAX_DAYS
  ) {
    return false;
  }

  const budget = Number(form.budget.replace(',', '.'));
  if (!Number.isFinite(budget) || budget < CAMPAIGN_GUIDELINES_MIN_BUDGET) {
    return false;
  }

  if (form.ageMin > form.ageMax) {
    return false;
  }

  return true;
}

export function addDaysToDateInput(dateInput: string, days: number): string {
  const date = new Date(`${dateInput}T00:00:00`);
  return toDateInputValue(addDays(date, days));
}
