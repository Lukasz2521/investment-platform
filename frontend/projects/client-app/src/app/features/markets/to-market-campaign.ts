import { CampaignPublic } from '../../core/campaigns/models/campaign.model';
import { campaignVideoUrl } from '../../core/campaigns/utils/campaign-video-url';
import { CampaignMembershipPlan } from '../campaign-creator/campaign-options';
import { MarketCampaign } from './market-campaigns';

const FALLBACK_IMAGE = '/images/partnerships/hero.jpg';

const MEMBERSHIP_PLANS: readonly CampaignMembershipPlan[] = [
  'fundament',
  'accelerator',
  'strategy',
  'alpha',
  'protector',
  'dominion',
];

function toNumber(value: string | number | null | undefined, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function midpoint(min: string, max: string): number {
  return (toNumber(min) + toNumber(max)) / 2;
}

function toMembershipPlan(value: string): CampaignMembershipPlan {
  return MEMBERSHIP_PLANS.includes(value as CampaignMembershipPlan)
    ? (value as CampaignMembershipPlan)
    : 'fundament';
}

export function toMarketCampaign(campaign: CampaignPublic, categoryName: string): MarketCampaign {
  return {
    id: campaign.id,
    title: campaign.title,
    imageUrl: campaign.image_url.trim() || FALLBACK_IMAGE,
    videoUrl: campaignVideoUrl(campaign.video_url),
    days: campaign.days_count,
    minBudget: toNumber(campaign.budget),
    currency: campaign.currency || 'EUR',
    profitMonthly: 0,
    epc: toNumber(campaign.stats?.epc, midpoint(campaign.epc_min, campaign.epc_max)),
    cpm: toNumber(campaign.stats?.cpm, toNumber(campaign.cpm_base)),
    ctr: toNumber(campaign.stats?.ctr, midpoint(campaign.ctr_min, campaign.ctr_max)),
    membershipPlan: toMembershipPlan(campaign.min_account),
    aiAssistant: false,
    categoryId: campaign.category_id,
    categoryName,
    countryCodes: campaign.location.map((code) => code.toLowerCase()),
  };
}
