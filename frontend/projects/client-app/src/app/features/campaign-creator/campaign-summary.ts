import { campaignGuidelinesDurationDays, CampaignGuidelinesForm } from './campaign-guidelines';
import { CampaignOption } from './campaign-options';

export type CampaignSummaryRisk = 'low' | 'medium' | 'high';

export type CampaignSummaryData = {
  campaignName: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  budget: number;
  currency: string;
  ageMin: number;
  ageMax: number;
  male: boolean;
  female: boolean;
  countryCodes: string[];
  cpm: number;
  epc: number;
  estimatedImpressions: number;
  estimatedGrossProfit: number;
  risk: CampaignSummaryRisk;
};

export function buildCampaignSummary(
  campaign: CampaignOption,
  guidelines: CampaignGuidelinesForm,
  countryCodes: string[],
): CampaignSummaryData | null {
  const durationDays = campaignGuidelinesDurationDays(
    guidelines.startDate,
    guidelines.endDate,
  );
  const budget = Number(guidelines.budget.replace(',', '.'));

  if (
    durationDays === null ||
    !Number.isFinite(budget) ||
    budget <= 0 ||
    campaign.cpm <= 0
  ) {
    return null;
  }

  const estimatedImpressions = Math.round((budget / campaign.cpm) * 1000);
  const estimatedGrossProfit =
    Math.round(budget * (campaign.profitMonthly / 100) * (durationDays / 30) * 100) / 100;

  return {
    campaignName: campaign.title,
    startDate: guidelines.startDate,
    endDate: guidelines.endDate,
    durationDays,
    budget,
    currency: campaign.currency,
    ageMin: guidelines.ageMin,
    ageMax: guidelines.ageMax,
    male: guidelines.male,
    female: guidelines.female,
    countryCodes: [...countryCodes],
    cpm: campaign.cpm,
    epc: campaign.epc,
    estimatedImpressions,
    estimatedGrossProfit,
    risk: resolveRisk(budget, durationDays),
  };
}

function resolveRisk(budget: number, durationDays: number): CampaignSummaryRisk {
  if (budget >= 5000 || durationDays >= 90) {
    return 'high';
  }

  if (budget >= 1000 || durationDays >= 30) {
    return 'medium';
  }

  return 'low';
}
