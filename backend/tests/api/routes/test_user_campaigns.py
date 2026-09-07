from datetime import datetime, timedelta, timezone
from decimal import Decimal
from uuid import uuid4

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app import crud
from app.core.config import settings
from app.models import Account, AccountType, Category, CategoryCreate


def _campaign_payload(category_id: str, title: str = "User campaign source") -> dict[str, object]:
    return {
        "title": title,
        "min_days": 3,
        "days_count": 30,
        "category_id": category_id,
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


def _set_user_available_balance(db: Session, email: str, amount: Decimal) -> Account:
    user = crud.get_user_by_email(session=db, email=email)
    assert user is not None
    account = db.exec(select(Account).where(Account.user_id == user.id)).first()
    if account is None:
        account = Account(
            user_id=user.id,
            balance=amount,
            available_balance=amount,
        )
        db.add(account)
    else:
        account.available_balance = amount
        db.add(account)
    db.commit()
    db.refresh(account)
    return account


def test_user_can_start_and_list_campaigns(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    normal_user_token_headers: dict[str, str],
    db: Session,
) -> None:
    category = crud.create_category(
        session=db,
        category_in=CategoryCreate(name=f"user-campaigns-{uuid4().hex[:8]}"),
    )
    create_response = client.post(
        f"{settings.API_V1_STR}/campaigns/",
        headers=superuser_token_headers,
        json=_campaign_payload(str(category.id)),
    )
    assert create_response.status_code == 200
    campaign_id = create_response.json()["id"]
    account = _set_user_available_balance(
        db, settings.EMAIL_TEST_USER, Decimal("1000")
    )

    today = datetime.now(timezone.utc).date()
    start_payload = {
        "campaign_id": campaign_id,
        "start_date": today.isoformat(),
        "end_date": (today + timedelta(days=30)).isoformat(),
        "budget": 250,
    }
    start_response = client.post(
        f"{settings.API_V1_STR}/user-campaigns/",
        headers=normal_user_token_headers,
        json=start_payload,
    )
    assert start_response.status_code == 200
    started = start_response.json()
    assert started["campaign_id"] == campaign_id
    assert started["status"] == "active"
    assert started["campaign"]["title"] == "User campaign source"

    db.refresh(account)
    assert account.available_balance == Decimal("750")

    past_response = client.post(
        f"{settings.API_V1_STR}/user-campaigns/",
        headers=normal_user_token_headers,
        json={
            **start_payload,
            "start_date": (today - timedelta(days=1)).isoformat(),
        },
    )
    assert past_response.status_code == 400

    list_response = client.get(
        f"{settings.API_V1_STR}/user-campaigns/",
        headers=normal_user_token_headers,
    )
    assert list_response.status_code == 200
    body = list_response.json()
    assert body["count"] >= 1
    assert any(item["id"] == started["id"] for item in body["data"])

    get_response = client.get(
        f"{settings.API_V1_STR}/user-campaigns/{started['id']}",
        headers=normal_user_token_headers,
    )
    assert get_response.status_code == 200
    assert get_response.json()["id"] == started["id"]

    delete_response = client.delete(
        f"{settings.API_V1_STR}/campaigns/{campaign_id}",
        headers=superuser_token_headers,
    )
    assert delete_response.status_code == 200
    db_category = db.get(Category, category.id)
    if db_category is not None:
        db.delete(db_category)
        db.commit()


def test_user_cannot_start_campaign_without_sufficient_funds(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    normal_user_token_headers: dict[str, str],
    db: Session,
) -> None:
    category = crud.create_category(
        session=db,
        category_in=CategoryCreate(name=f"user-campaigns-{uuid4().hex[:8]}"),
    )
    create_response = client.post(
        f"{settings.API_V1_STR}/campaigns/",
        headers=superuser_token_headers,
        json=_campaign_payload(str(category.id)),
    )
    assert create_response.status_code == 200
    campaign_id = create_response.json()["id"]
    _set_user_available_balance(db, settings.EMAIL_TEST_USER, Decimal("100"))

    today = datetime.now(timezone.utc).date()
    start_response = client.post(
        f"{settings.API_V1_STR}/user-campaigns/",
        headers=normal_user_token_headers,
        json={
            "campaign_id": campaign_id,
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=30)).isoformat(),
            "budget": 250,
        },
    )
    assert start_response.status_code == 400
    assert start_response.json()["detail"] == "Insufficient funds"

    delete_response = client.delete(
        f"{settings.API_V1_STR}/campaigns/{campaign_id}",
        headers=superuser_token_headers,
    )
    assert delete_response.status_code == 200
    db_category = db.get(Category, category.id)
    if db_category is not None:
        db.delete(db_category)
        db.commit()
