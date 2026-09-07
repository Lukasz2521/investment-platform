from decimal import Decimal
from random import Random

from app.campaigns.engine import midpoint, step_metric


def test_midpoint() -> None:
    assert midpoint(Decimal("1"), Decimal("5")) == Decimal("3.0000")


def test_step_metric_stays_within_range() -> None:
    rng = Random(0)
    value = Decimal("10.0000")
    for _ in range(200):
        value = step_metric(
            value,
            Decimal("10"),
            Decimal("5"),
            Decimal("20"),
            rng=rng,
        )
        assert Decimal("5") <= value <= Decimal("20")


def test_step_metric_clamps_when_min_equals_max() -> None:
    value = step_metric(
        Decimal("3"),
        Decimal("10"),
        Decimal("7"),
        Decimal("7"),
        rng=Random(1),
    )
    assert value == Decimal("7.0000")
