from datetime import datetime, timedelta, timezone
from decimal import Decimal
from uuid import UUID, uuid4

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app import crud
from app.core.config import settings
from app.models import Account, AccountType, Category, CategoryCreate, UserCampaign


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
        account.balance = amount
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
    assert started["cpm"] is not None
    assert started["epc"] is not None
    assert started["ctr"] is not None
    assert started["participation"] == account.participation
    assert started["net_profit"] is not None

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


def test_user_campaign_freezes_metrics_and_settles_profit(
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
        json=_campaign_payload(str(category.id), title="Settle source"),
    )
    assert create_response.status_code == 200
    campaign_id = create_response.json()["id"]
    live_stats = create_response.json()["stats"]
    account = _set_user_available_balance(
        db, settings.EMAIL_TEST_USER, Decimal("1000")
    )
    account.participation = 18
    db.add(account)
    db.commit()
    db.refresh(account)

    today = datetime.now(timezone.utc).date()
    start_response = client.post(
        f"{settings.API_V1_STR}/user-campaigns/",
        headers=normal_user_token_headers,
        json={
            "campaign_id": campaign_id,
            "start_date": today.isoformat(),
            "end_date": (today + timedelta(days=30)).isoformat(),
            "budget": 1000,
        },
    )
    assert start_response.status_code == 200
    started = start_response.json()
    assert started["cpm"] == live_stats["cpm"]
    assert started["epc"] == live_stats["epc"]
    assert started["ctr"] == live_stats["ctr"]
    frozen_cpm = Decimal(started["cpm"])
    expected_net = Decimal(started["net_profit"])
    expected_payout = Decimal("1000") + expected_net

    db.refresh(account)
    assert account.available_balance == Decimal("0")
    assert account.balance == Decimal("1000")

    live_campaign = crud.get_campaign(session=db, campaign_id=campaign_id)
    assert live_campaign is not None
    assert live_campaign.stats is not None
    live_campaign.stats.cpm = live_campaign.cpm_max
    db.add(live_campaign.stats)
    db.commit()

    get_active = client.get(
        f"{settings.API_V1_STR}/user-campaigns/{started['id']}",
        headers=normal_user_token_headers,
    )
    assert get_active.status_code == 200
    active_body = get_active.json()
    assert Decimal(active_body["cpm"]) == frozen_cpm
    assert active_body["status"] == "active"

    row = db.get(UserCampaign, UUID(started["id"]))
    assert row is not None
    row.created_at = datetime.now(timezone.utc) - timedelta(minutes=6)
    db.add(row)
    db.commit()

    get_completed = client.get(
        f"{settings.API_V1_STR}/user-campaigns/{started['id']}",
        headers=normal_user_token_headers,
    )
    assert get_completed.status_code == 200
    completed = get_completed.json()
    assert completed["status"] == "completed"
    assert completed["settled_at"] is not None
    assert Decimal(completed["cpm"]) == frozen_cpm

    db.refresh(account)
    assert account.available_balance == expected_payout
    assert account.balance == Decimal("1000") + expected_net

    get_again = client.get(
        f"{settings.API_V1_STR}/user-campaigns/{started['id']}",
        headers=normal_user_token_headers,
    )
    assert get_again.status_code == 200
    db.refresh(account)
    assert account.available_balance == expected_payout

    user = crud.get_user_by_email(session=db, email=settings.EMAIL_TEST_USER)
    assert user is not None
    me_account = client.get(
        f"{settings.API_V1_STR}/users/{user.id}",
        headers=normal_user_token_headers,
    )
    assert me_account.status_code == 200
    assert Decimal(me_account.json()["account"]["available_balance"]) == expected_payout

    delete_response = client.delete(
        f"{settings.API_V1_STR}/campaigns/{campaign_id}",
        headers=superuser_token_headers,
    )
    assert delete_response.status_code == 200
    db_category = db.get(Category, category.id)
    if db_category is not None:
        db.delete(db_category)
        db.commit()
