from datetime import datetime, timedelta, timezone
from decimal import Decimal
from uuid import UUID

from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, select

from app.campaigns.engine import midpoint, step_metric
from app.models import Campaign, CampaignMetricTick, CampaignStats, get_datetime_utc

TICK_INTERVAL = timedelta(minutes=30)
DAILY_SNAPSHOT_HOUR_UTC = 0


def campaign_end_at(campaign: Campaign) -> datetime | None:
    if campaign.created_at is None:
        return None
    start = campaign.created_at
    if start.tzinfo is None:
        start = start.replace(tzinfo=timezone.utc)
    return start + timedelta(days=campaign.days_count)


def is_campaign_running(campaign: Campaign, now: datetime | None = None) -> bool:
    now = now or get_datetime_utc()
    end_at = campaign_end_at(campaign)
    if end_at is None:
        return True
    return now < end_at


def initial_campaign_stats(
    campaign: Campaign, *, now: datetime | None = None
) -> CampaignStats:
    now = now or get_datetime_utc()
    return CampaignStats(
        campaign_id=campaign.id,
        cpm=campaign.cpm_base,
        epc=midpoint(campaign.epc_min, campaign.epc_max),
        ctr=midpoint(campaign.ctr_min, campaign.ctr_max),
        calculated_at=now,
        next_tick_at=now + TICK_INTERVAL,
    )


def clamp_campaign_stats(campaign: Campaign, stats: CampaignStats) -> None:
    stats.cpm = min(campaign.cpm_max, max(campaign.cpm_min, stats.cpm))
    stats.epc = min(campaign.epc_max, max(campaign.epc_min, stats.epc))
    stats.ctr = min(campaign.ctr_max, max(campaign.ctr_min, stats.ctr))


def record_daily_metric_tick(
    session: Session,
    *,
    campaign_id: UUID,
    cpm: Decimal,
    epc: Decimal,
    ctr: Decimal,
    now: datetime | None = None,
) -> CampaignMetricTick | None:
    now = now or get_datetime_utc()
    recorded_on = now.astimezone(timezone.utc).date()
    existing = session.exec(
        select(CampaignMetricTick).where(
            CampaignMetricTick.campaign_id == campaign_id,
            CampaignMetricTick.recorded_on == recorded_on,
        )
    ).first()
    if existing is not None:
        return None

    tick = CampaignMetricTick(
        campaign_id=campaign_id,
        recorded_on=recorded_on,
        recorded_at=now,
        cpm=cpm,
        epc=epc,
        ctr=ctr,
    )
    session.add(tick)
    return tick


def run_tick(session: Session, *, now: datetime | None = None) -> int:
    now = now or get_datetime_utc()
    now_utc = now.astimezone(timezone.utc)
    write_daily_tick = now_utc.hour == DAILY_SNAPSHOT_HOUR_UTC
    campaigns = session.exec(
        select(Campaign)
        .options(selectinload(Campaign.stats))
        .order_by(col(Campaign.created_at).asc(), col(Campaign.id).asc())
    ).all()

    updated = 0
    for campaign in campaigns:
        stats = campaign.stats
        if stats is None or not is_campaign_running(campaign, now):
            continue
        stats.cpm = step_metric(
            stats.cpm, campaign.cpm_base, campaign.cpm_min, campaign.cpm_max
        )
        stats.epc = step_metric(
            stats.epc,
            midpoint(campaign.epc_min, campaign.epc_max),
            campaign.epc_min,
            campaign.epc_max,
        )
        stats.ctr = step_metric(
            stats.ctr,
            midpoint(campaign.ctr_min, campaign.ctr_max),
            campaign.ctr_min,
            campaign.ctr_max,
        )
        stats.calculated_at = now
        stats.next_tick_at = now + TICK_INTERVAL
        session.add(stats)
        if write_daily_tick:
            record_daily_metric_tick(
                session,
                campaign_id=campaign.id,
                cpm=stats.cpm,
                epc=stats.epc,
                ctr=stats.ctr,
                now=now_utc,
            )
        updated += 1

    return updated
