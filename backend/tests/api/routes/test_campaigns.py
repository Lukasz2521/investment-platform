from decimal import Decimal
from uuid import uuid4

from fastapi.testclient import TestClient
from sqlmodel import Session

from app import crud
from app.core.config import settings
from app.models import AccountType, Category, CategoryCreate


def test_read_campaign_metric_ticks(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    db: Session,
) -> None:
    category = crud.create_category(
        session=db,
        category_in=CategoryCreate(name=f"chart-ticks-{uuid4().hex[:8]}"),
    )
    payload = {
        "title": "Chart campaign",
        "min_days": 3,
        "days_count": 30,
        "category_id": str(category.id),
        "budget": 200,
        "currency": "EUR",
        "cpm_base": 10,
        "cpm_min": 5,
        "cpm_max": 20,
        "epc_min": 1,
        "epc_max": 5,
        "ctr_min": 0.5,
        "ctr_max": 3,
        "location": ["PL"],
        "min_account": AccountType.FUNDAMENT.value,
        "image_url": "",
        "video_url": "",
    }
    create_response = client.post(
        f"{settings.API_V1_STR}/campaigns/",
        headers=superuser_token_headers,
        json=payload,
    )
    assert create_response.status_code == 200
    campaign_id = create_response.json()["id"]

    ticks_response = client.get(
        f"{settings.API_V1_STR}/campaigns/{campaign_id}/metric-ticks",
        headers=superuser_token_headers,
    )
    assert ticks_response.status_code == 200
    body = ticks_response.json()
    assert body["count"] == 1
    assert len(body["data"]) == 1
    assert Decimal(str(body["data"][0]["cpm"])) == Decimal("10.0000")

    delete_response = client.delete(
        f"{settings.API_V1_STR}/campaigns/{campaign_id}",
        headers=superuser_token_headers,
    )
    assert delete_response.status_code == 200
    db_category = db.get(Category, category.id)
    if db_category is not None:
        db.delete(db_category)
        db.commit()
