import { ACCOUNT_TYPE_OPTIONS } from '../../users/models/account-type.model';
import { CategoryPublic } from '../models/category.model';
import { CampaignPublic } from '../models/campaign.model';

const ACCOUNT_TYPE_LABELS = Object.fromEntries(
  ACCOUNT_TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<string, string>;

export type CampaignTableRow = CampaignPublic & {
  category_name: string;
  min_account_label: string;
};

export function mapCampaignsForTable(
  campaigns: CampaignPublic[],
  categories: CategoryPublic[],
): CampaignTableRow[] {
  const categoryNameById = Object.fromEntries(categories.map((category) => [category.id, category.name]));

  return campaigns.map((campaign) => ({
    ...campaign,
    category_name: categoryNameById[campaign.category_id] ?? '-',
    min_account_label: ACCOUNT_TYPE_LABELS[campaign.min_account] ?? campaign.min_account,
  }));
}

export function formatCpmRange(cpmMin: string, cpmMax: string): string {
  const min = Number(cpmMin);
  const max = Number(cpmMax);

  if (Number.isNaN(min) || Number.isNaN(max)) {
    return '-';
  }

  return `${min} - ${max}`;
}
