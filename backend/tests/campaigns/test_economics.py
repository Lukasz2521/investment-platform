from decimal import Decimal

from app.campaigns.economics import estimate_campaign_economics


def test_estimate_matches_documented_example() -> None:
    result = estimate_campaign_economics(
        budget=Decimal("1000"),
        cpm=Decimal("3.14"),
        epc=Decimal("0.23"),
        ctr=Decimal("2.67"),
        participation=18,
    )

    assert result.impressions == 318_470
    assert result.clicks == 8503
    assert result.gross_revenue == Decimal("1955.69")
    assert result.gross_profit == Decimal("955.69")
    assert result.net_profit == Decimal("172.02")
    assert result.payout == Decimal("1172.02")


def test_estimate_uses_account_participation() -> None:
    fundament = estimate_campaign_economics(
        budget=Decimal("1000"),
        cpm=Decimal("3.14"),
        epc=Decimal("0.23"),
        ctr=Decimal("2.67"),
        participation=18,
    )
    accelerator = estimate_campaign_economics(
        budget=Decimal("1000"),
        cpm=Decimal("3.14"),
        epc=Decimal("0.23"),
        ctr=Decimal("2.67"),
        participation=36,
    )

    assert accelerator.net_profit == Decimal("344.05")
    assert accelerator.net_profit > fundament.net_profit


def test_estimate_zero_budget() -> None:
    result = estimate_campaign_economics(
        budget=Decimal("0"),
        cpm=Decimal("3.14"),
        epc=Decimal("0.23"),
        ctr=Decimal("2.67"),
        participation=18,
    )
    assert result.impressions == 0
    assert result.clicks == 0
    assert result.net_profit == Decimal("0.00")
