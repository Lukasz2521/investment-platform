import logging
import signal
import time

from sqlmodel import Session

from app.campaigns.tick import TICK_INTERVAL, run_tick
from app.core.db import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("campaign-ticker")

_stop = False
_ERROR_RETRY_SECONDS = 30
_SLEEP_SLICE_SECONDS = 1.0


def _handle_stop(_signum: int, _frame: object) -> None:
    global _stop
    _stop = True


def _sleep_interruptible(seconds: float) -> None:
    deadline = time.monotonic() + seconds
    while not _stop:
        remaining = deadline - time.monotonic()
        if remaining <= 0:
            return
        time.sleep(min(_SLEEP_SLICE_SECONDS, remaining))


def main() -> None:
    signal.signal(signal.SIGTERM, _handle_stop)
    signal.signal(signal.SIGINT, _handle_stop)
    logger.info(
        "campaign ticker started; interval=%s",
        TICK_INTERVAL,
    )

    while not _stop:
        try:
            with Session(engine) as session:
                updated = run_tick(session)
                session.commit()
            logger.info("tick updated %s running campaigns", updated)
            _sleep_interruptible(TICK_INTERVAL.total_seconds())
        except Exception:
            logger.exception("tick failed")
            _sleep_interruptible(_ERROR_RETRY_SECONDS)

    logger.info("campaign ticker stopped")


if __name__ == "__main__":
    main()
