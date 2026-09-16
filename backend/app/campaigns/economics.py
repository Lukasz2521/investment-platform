from dataclasses import dataclass
from decimal import Decimal, ROUND_DOWN, ROUND_HALF_UP

MONEY = Decimal("0.01")
ZERO = Decimal("0.00")


@dataclass(frozen=True)
class CampaignEconomics:
    impressions: int
    clicks: int
    gross_revenue: Decimal
    gross_profit: Decimal
    net_profit: Decimal
    payout: Decimal
    budget: Decimal

    @property
    def profit_percent(self) -> Decimal:
        if self.budget <= 0:
            return ZERO
        return ((self.gross_profit / self.budget) * Decimal("100")).quantize(
            MONEY, rounding=ROUND_HALF_UP
        )

    @property
    def net_profit_percent(self) -> Decimal:
        if self.budget <= 0:
            return ZERO
        return ((self.net_profit / self.budget) * Decimal("100")).quantize(
            MONEY, rounding=ROUND_HALF_UP
        )


def _as_decimal(value: Decimal | int | float | str) -> Decimal:
    if isinstance(value, Decimal):
        return value
    return Decimal(str(value))


def _money(value: Decimal) -> Decimal:
    return value.quantize(MONEY, rounding=ROUND_HALF_UP)


def estimate_campaign_economics(
    *,
    budget: Decimal | int | float | str,
    cpm: Decimal | int | float | str,
    epc: Decimal | int | float | str,
    ctr: Decimal | int | float | str,
    participation: int,
) -> CampaignEconomics:
    budget_dec = _as_decimal(budget)
    cpm_dec = _as_decimal(cpm)
    epc_dec = _as_decimal(epc)
    ctr_dec = _as_decimal(ctr)
    share = max(0, min(100, int(participation)))

    if budget_dec <= 0 or cpm_dec <= 0:
        safe_budget = _money(max(ZERO, budget_dec))
        return CampaignEconomics(
            impressions=0,
            clicks=0,
            gross_revenue=ZERO,
            gross_profit=ZERO,
            net_profit=ZERO,
            payout=safe_budget,
            budget=safe_budget,
        )

    packages = _money(budget_dec / cpm_dec)
    impressions = int(packages * Decimal("1000"))
    clicks_raw = Decimal(impressions) * (ctr_dec / Decimal("100"))
    clicks = int(clicks_raw.to_integral_value(rounding=ROUND_DOWN))
    gross_revenue = _money(Decimal(clicks) * epc_dec)
    gross_profit = _money(gross_revenue - budget_dec)
    taxable_profit = max(ZERO, gross_profit)
    net_profit = _money(taxable_profit * Decimal(share) / Decimal("100"))
    payout = _money(budget_dec + net_profit)

    return CampaignEconomics(
        impressions=impressions,
        clicks=clicks,
        gross_revenue=gross_revenue,
        gross_profit=gross_profit,
        net_profit=net_profit,
        payout=payout,
        budget=_money(budget_dec),
    )
