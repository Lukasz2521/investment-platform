from decimal import Decimal
from random import Random, SystemRandom

QUANT = Decimal("0.0001")
JITTER_RANGE = 0.04
PULL_TO_BASE = Decimal("0.15")

_default_rng = SystemRandom()


def midpoint(low: Decimal, high: Decimal) -> Decimal:
    return ((low + high) / Decimal("2")).quantize(QUANT)


def step_metric(
    current: Decimal,
    base: Decimal,
    low: Decimal,
    high: Decimal,
    *,
    rng: Random | None = None,
) -> Decimal:
    if low > high:
        low, high = high, low

    current = _clamp(current, low, high)
    base = _clamp(base, low, high)
    source = rng or _default_rng
    jitter = Decimal(str(source.uniform(-JITTER_RANGE, JITTER_RANGE)))
    toward_base = (base - current) * PULL_TO_BASE
    nxt = current + toward_base + current * jitter
    return _clamp(nxt.quantize(QUANT), low, high)


def _clamp(value: Decimal, low: Decimal, high: Decimal) -> Decimal:
    return min(high, max(low, value))
