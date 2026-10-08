from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from decimal import Decimal, ROUND_HALF_UP

from app.campaigns.economics import ZERO, CampaignEconomics, estimate_campaign_economics, _money
from app.campaigns.tick import TICK_INTERVAL, USER_CAMPAIGN_DURATION

MAX_RISK_MODE = 10_000


@dataclass(frozen=True)
class RiskBaseline:
    spent: Decimal
    impressions: int
    clicks: int
    revenue: Decimal


def risk_revenue_ratio(risk_mode: int) -> Decimal | None:
    """Revenue multiplier for the budget still left when risk mode was set.

    1 returns 99% of that remainder, 100 returns 0, 101 returns 101%.
    Money already spent keeps the revenue it had already earned.
    Zero and below leave the natural campaign path unchanged.
    """
    if risk_mode <= 0:
        return None
    if risk_mode <= 100:
        return Decimal(100 - risk_mode) / Decimal(100)
    return Decimal(risk_mode) / Decimal(100)


def campaign_window(
    created_at: datetime | None,
    end_date,
) -> tuple[datetime, datetime] | None:
    if USER_CAMPAIGN_DURATION is not None:
        if created_at is None:
            return None
        opened = created_at if created_at.tzinfo else created_at.replace(tzinfo=timezone.utc)
        return opened, opened + USER_CAMPAIGN_DURATION

    if end_date is None:
        return None
    opened = created_at or datetime.combine(end_date, datetime.min.time(), tzinfo=timezone.utc)
    if opened.tzinfo is None:
        opened = opened.replace(tzinfo=timezone.utc)
    ends = datetime.combine(end_date + timedelta(days=1), datetime.min.time(), tzinfo=timezone.utc)
    return opened, ends


def delivery_fraction(
    created_at: datetime | None,
    end_date,
    now: datetime,
) -> Decimal:
    window = campaign_window(created_at, end_date)
    if window is None:
        return Decimal(0)
    opened, ends = window
    now_utc = now if now.tzinfo else now.replace(tzinfo=timezone.utc)
    if now_utc >= ends:
        return Decimal(1)
    if now_utc <= opened:
        return Decimal(0)
    duration = ends - opened
    total_ticks = max(1, round(duration / TICK_INTERVAL))
    elapsed_ticks = min(total_ticks, int((now_utc - opened) / TICK_INTERVAL))
    return Decimal(elapsed_ticks) / Decimal(total_ticks)


def natural_baseline(
    *,
    budget: Decimal,
    fraction: Decimal,
    cpm: Decimal,
    epc: Decimal,
    ctr: Decimal,
    participation: int,
) -> RiskBaseline:
    spent = _money(max(ZERO, budget) * _clamp_fraction(fraction))
    economics = estimate_campaign_economics(
        budget=spent,
        cpm=cpm,
        epc=epc,
        ctr=ctr,
        participation=participation,
    )
    return RiskBaseline(
        spent=spent,
        impressions=economics.impressions,
        clicks=economics.clicks,
        revenue=economics.gross_revenue,
    )


def project_risk(
    *,
    budget: Decimal,
    cpm: Decimal,
    epc: Decimal,
    ctr: Decimal,
    participation: int,
    fraction: Decimal,
    risk_mode: int,
    baseline: RiskBaseline,
) -> CampaignEconomics:
    """Economics delivered up to `fraction` of the campaign."""
    progress = _clamp_fraction(fraction)
    full_budget = _money(max(ZERO, budget))
    if risk_mode <= 0:
        spent = full_budget if progress >= 1 else _money(full_budget * progress)
        return estimate_campaign_economics(
            budget=spent,
            cpm=cpm,
            epc=epc,
            ctr=ctr,
            participation=participation,
        )

    ratio = risk_revenue_ratio(risk_mode) or Decimal(0)
    locked_spent = _money(min(full_budget, max(ZERO, baseline.spent)))
    locked_revenue = _money(max(ZERO, baseline.revenue))
    locked_impressions = max(0, baseline.impressions)
    locked_clicks = max(0, baseline.clicks)
    remaining_budget = _money(full_budget - locked_spent)
    needed = _money(remaining_budget * ratio)
    spent_now = full_budget if progress >= 1 else _money(full_budget * progress)

    if remaining_budget <= 0:
        return _economics(
            budget=full_budget if progress >= 1 else spent_now,
            impressions=locked_impressions,
            clicks=locked_clicks,
            revenue=locked_revenue,
            participation=participation,
            risk_loss=True,
        )

    if spent_now <= locked_spent:
        if locked_spent <= 0:
            scale = Decimal(0)
        else:
            scale = min(Decimal(1), spent_now / locked_spent)
        return _economics(
            budget=spent_now,
            impressions=int(Decimal(locked_impressions) * scale),
            clicks=int(Decimal(locked_clicks) * scale),
            revenue=_money(locked_revenue * scale),
            participation=participation,
            risk_loss=True,
        )

    tail_progress = (
        Decimal(1)
        if progress >= 1
        else min(Decimal(1), (spent_now - locked_spent) / remaining_budget)
    )

    tail_impressions = estimate_campaign_economics(
        budget=remaining_budget,
        cpm=cpm,
        epc=epc,
        ctr=Decimal(0),
        participation=participation,
    ).impressions
    if needed <= 0 or epc <= 0 or remaining_budget <= 0:
        tail_clicks = 0
        tail_revenue = ZERO
    else:
        tail_clicks = int((needed / epc).to_integral_value(rounding=ROUND_HALF_UP))
        tail_revenue = needed

    if tail_progress >= 1:
        impressions = locked_impressions + tail_impressions
        clicks = locked_clicks + tail_clicks
        revenue = _money(locked_revenue + tail_revenue)
        spent = full_budget
    else:
        impressions = locked_impressions + int(Decimal(tail_impressions) * tail_progress)
        clicks = locked_clicks + int(Decimal(tail_clicks) * tail_progress)
        revenue = _money(locked_revenue + tail_revenue * tail_progress)
        spent = _money(locked_spent + remaining_budget * tail_progress)

    return _economics(
        budget=spent if tail_progress < 1 else full_budget,
        impressions=impressions,
        clicks=clicks,
        revenue=revenue,
        participation=participation,
        risk_loss=True,
    )


def _economics(
    *,
    budget: Decimal,
    impressions: int,
    clicks: int,
    revenue: Decimal,
    participation: int,
    risk_loss: bool,
) -> CampaignEconomics:
    safe_budget = _money(max(ZERO, budget))
    safe_revenue = _money(max(ZERO, revenue))
    gross_profit = _money(safe_revenue - safe_budget)
    share = max(0, min(100, int(participation)))
    if gross_profit >= 0:
        net_profit = _money(gross_profit * Decimal(share) / Decimal(100))
        payout = _money(safe_budget + net_profit)
    elif risk_loss:
        net_profit = gross_profit
        payout = safe_revenue
    else:
        net_profit = ZERO
        payout = safe_budget
    return CampaignEconomics(
        impressions=max(0, impressions),
        clicks=max(0, clicks),
        gross_revenue=safe_revenue,
        gross_profit=gross_profit,
        net_profit=net_profit,
        payout=payout,
        budget=safe_budget,
    )


def _clamp_fraction(fraction: Decimal) -> Decimal:
    if fraction <= 0:
        return Decimal(0)
    if fraction >= 1:
        return Decimal(1)
    return fraction
