import { CAMPAIGN_COUNTRY_NAME_BY_ISO } from '../../../../../client-app/src/app/features/campaign-creator/campaign-country-codes';

export type CampaignCountry = {
  code: string;
  name: string;
};

export const CAMPAIGN_COUNTRIES: CampaignCountry[] = Object.entries(CAMPAIGN_COUNTRY_NAME_BY_ISO)
  .map(([code, name]) => ({ code: code.toUpperCase(), name }))
  .sort((left, right) => left.name.localeCompare(right.name));

const COUNTRY_BY_CODE = new Map(CAMPAIGN_COUNTRIES.map((country) => [country.code, country]));

export function campaignCountryFromCode(code: string): CampaignCountry {
  const normalized = code.trim().toUpperCase();
  return COUNTRY_BY_CODE.get(normalized) ?? { code: normalized, name: normalized };
}
