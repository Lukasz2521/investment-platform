from decimal import Decimal

from app.campaigns.economics import estimate_campaign_economics
from app.campaigns.risk import RiskBaseline, natural_baseline, project_risk, risk_revenue_ratio


def test_risk_ratio_matches_the_scale() -> None:
    assert risk_revenue_ratio(0) is None
    assert risk_revenue_ratio(1) == Decimal("0.99")
    assert risk_revenue_ratio(2) == Decimal("0.98")
    assert risk_revenue_ratio(100) == Decimal("0")
    assert risk_revenue_ratio(101) == Decimal("1.01")
    assert risk_revenue_ratio(110) == Decimal("1.10")


def test_risk_from_the_start_hits_the_target_revenue() -> None:
    budget = Decimal("1000")
    rates = dict(
        cpm=Decimal("3.14"),
        epc=Decimal("0.30"),
        ctr=Decimal("1.15"),
        participation=18,
    )
    empty = RiskBaseline(Decimal("0"), 0, 0, Decimal("0"))

    loss = project_risk(
        budget=budget, fraction=Decimal(1), risk_mode=1, baseline=empty, **rates
    )
    assert loss.gross_revenue == Decimal("990.00")
    assert loss.gross_profit == Decimal("-10.00")
    assert loss.payout == Decimal("990.00")

    wiped = project_risk(
        budget=budget, fraction=Decimal(1), risk_mode=100, baseline=empty, **rates
    )
    assert wiped.gross_revenue == Decimal("0.00")
    assert wiped.impressions > 0
    assert wiped.clicks == 0
    assert wiped.payout == Decimal("0.00")

    gain = project_risk(
        budget=budget, fraction=Decimal(1), risk_mode=101, baseline=empty, **rates
    )
    assert gain.gross_revenue == Decimal("1010.00")
    assert gain.gross_profit == Decimal("10.00")
    assert gain.net_profit == Decimal("1.80")
    assert gain.payout == Decimal("1001.80")


def test_risk_keeps_revenue_already_earned() -> None:
    budget = Decimal("1000")
    rates = dict(
        cpm=Decimal("3.14"),
        epc=Decimal("0.30"),
        ctr=Decimal("1.15"),
        participation=18,
    )
    baseline = natural_baseline(budget=budget, fraction=Decimal("0.5"), **rates)
    locked = estimate_campaign_economics(budget=baseline.spent, participation=18, **{
        "cpm": rates["cpm"],
        "epc": rates["epc"],
        "ctr": rates["ctr"],
    })
    assert baseline.revenue == locked.gross_revenue
    assert baseline.revenue > 0

    finished = project_risk(
        budget=budget,
        fraction=Decimal(1),
        risk_mode=100,
        baseline=baseline,
        **rates,
    )
    assert finished.gross_revenue == baseline.revenue
    assert finished.clicks == baseline.clicks
    assert finished.impressions > baseline.impressions
    assert finished.gross_profit == finished.gross_revenue - budget


def test_documented_partial_loss_cannot_reach_zero() -> None:
    """Spent 500, earned 550, risk 100 burns the rest and keeps 550."""
    rates = dict(
        cpm=Decimal("3.14"),
        epc=Decimal("0.30"),
        ctr=Decimal("1.15"),
        participation=18,
    )
    baseline = RiskBaseline(
        spent=Decimal("500.00"),
        impressions=1000,
        clicks=100,
        revenue=Decimal("550.00"),
    )
    finished = project_risk(
        budget=Decimal("1000"),
        fraction=Decimal(1),
        risk_mode=100,
        baseline=baseline,
        **rates,
    )
    assert finished.gross_revenue == Decimal("550.00")
    assert finished.clicks == 100
    assert finished.impressions > 1000
    assert finished.gross_profit == Decimal("-450.00")
    assert finished.payout == Decimal("550.00")
