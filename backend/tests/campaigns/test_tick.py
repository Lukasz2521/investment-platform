from datetime import datetime, timedelta, timezone
from decimal import Decimal
from uuid import UUID, uuid4

from sqlmodel import Session, col, select

from app import crud
from app.campaigns.tick import TICK_INTERVAL, is_campaign_running, run_tick
from app.models import (
    AccountType,
    Campaign,
    CampaignCreate,
    CampaignMetricTick,
    CampaignStats,
    Category,
    CategoryCreate,
    get_datetime_utc,
)


def _create_campaign(db: Session, *, days_count: int = 30) -> tuple[Category, Campaign]:
    category = crud.create_category(
        session=db,
        category_in=CategoryCreate(name=f"ticker-test-{uuid4().hex[:8]}"),
    )
    campaign = crud.create_campaign(
        session=db,
        campaign_in=CampaignCreate(
            title="Ticker campaign",
            min_days=3,
            days_count=days_count,
            category_id=category.id,
            budget=Decimal("200"),
            currency="EUR",
            cpm_base=Decimal("10"),
            cpm_min=Decimal("5"),
            cpm_max=Decimal("20"),
            epc_min=Decimal("1"),
            epc_max=Decimal("5"),
            ctr_min=Decimal("0.5"),
            ctr_max=Decimal("3"),
            location=["PL"],
            min_account=AccountType.FUNDAMENT,
            image_url="",
            video_url="",
        ),
    )
    return category, campaign


def _metric_ticks(db: Session, campaign_id: UUID) -> list[CampaignMetricTick]:
    return list(
        db.exec(
            select(CampaignMetricTick)
            .where(CampaignMetricTick.campaign_id == campaign_id)
            .order_by(col(CampaignMetricTick.recorded_on).asc())
        ).all()
    )


def test_tick_interval_is_thirty_minutes() -> None:
    assert TICK_INTERVAL == timedelta(minutes=30)


def test_create_campaign_inserts_stats(db: Session) -> None:
    category, campaign = _create_campaign(db)
    try:
        stats = db.get(CampaignStats, campaign.id)
        assert stats is not None
        assert stats.cpm == Decimal("10.0000")
        assert stats.epc == Decimal("3.0000")
        assert stats.ctr == Decimal("1.7500")
        ticks = _metric_ticks(db, campaign.id)
        assert len(ticks) == 1
        assert ticks[0].cpm == Decimal("10.0000")
    finally:
        db.delete(campaign)
        db.delete(category)
        db.commit()


def test_run_tick_updates_all_running_campaigns_each_pass(db: Session) -> None:
    category, campaign = _create_campaign(db)
    try:
        stats = db.get(CampaignStats, campaign.id)
        assert stats is not None

        first_updated = run_tick(db)
        db.commit()
        db.refresh(stats)

        assert first_updated >= 1
        assert Decimal("5") <= stats.cpm <= Decimal("20")
        assert Decimal("1") <= stats.epc <= Decimal("5")
        assert Decimal("0.5") <= stats.ctr <= Decimal("3")
        assert stats.next_tick_at == stats.calculated_at + TICK_INTERVAL
        first_calculated_at = stats.calculated_at

        later = first_calculated_at + timedelta(minutes=1)
        second_updated = run_tick(db, now=later)
        db.commit()
        db.refresh(stats)

        assert second_updated >= 1
        assert stats.calculated_at == later
    finally:
        db.delete(campaign)
        db.delete(category)
        db.commit()


def test_run_tick_skips_ended_campaigns(db: Session) -> None:
    category, campaign = _create_campaign(db, days_count=3)
    try:
        assert campaign.created_at is not None
        campaign.created_at = campaign.created_at - timedelta(days=4)
        db.add(campaign)
        db.commit()
        db.refresh(campaign)

        now = get_datetime_utc()
        assert not is_campaign_running(campaign, now)

        stats = db.get(CampaignStats, campaign.id)
        assert stats is not None
        previous_cpm = stats.cpm
        previous_calculated_at = stats.calculated_at

        run_tick(db, now=now)
        db.commit()
        db.refresh(stats)

        assert stats.cpm == previous_cpm
        assert stats.calculated_at == previous_calculated_at
    finally:
        db.delete(campaign)
        db.delete(category)
        db.commit()


def test_run_tick_writes_one_daily_metric_tick_at_midnight_utc(db: Session) -> None:
    category, campaign = _create_campaign(db)
    try:
        assert len(_metric_ticks(db, campaign.id)) == 1

        midday = datetime(2026, 9, 8, 12, 0, tzinfo=timezone.utc)
        run_tick(db, now=midday)
        db.commit()
        assert len(_metric_ticks(db, campaign.id)) == 1

        first_midnight = datetime(2026, 9, 8, 0, 10, tzinfo=timezone.utc)
        run_tick(db, now=first_midnight)
        db.commit()
        ticks = _metric_ticks(db, campaign.id)
        assert len(ticks) == 2
        assert ticks[-1].recorded_on.isoformat() == "2026-09-08"

        later_same_hour = datetime(2026, 9, 8, 0, 40, tzinfo=timezone.utc)
        run_tick(db, now=later_same_hour)
        db.commit()
        assert len(_metric_ticks(db, campaign.id)) == 2
    finally:
        db.delete(campaign)
        db.delete(category)
        db.commit()
