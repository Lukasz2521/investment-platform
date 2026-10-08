from datetime import datetime, timedelta, timezone
from decimal import Decimal
from uuid import UUID, uuid4

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app import crud
from app.core.config import settings
from app.models import (
    REQUIRED_USER_DOCUMENT_TYPES,
    Account,
    AccountType,
    Campaign,
    Category,
    CategoryCreate,
    UserCampaign,
    UserDocument,
)


def _purge_campaign(db: Session, campaign_id: str) -> None:
    campaign = db.get(Campaign, UUID(campaign_id))
    if campaign is not None:
        db.delete(campaign)
        db.commit()


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


def _prepare_user_for_campaigns(db: Session, email: str) -> None:
    user = crud.get_user_by_email(session=db, email=email)
    assert user is not None
    user.name = user.name or "Test"
    user.last_name = user.last_name or "User"
    user.phone = user.phone or "123456789"
    user.country = user.country or "Poland"
    user.city = user.city or "Warsaw"
    user.address_line_one = user.address_line_one or "Main 1"
    user.address_line_two = user.address_line_two or "00-001"
    user.timezone = user.timezone or "Europe/Warsaw"
    db.add(user)
    for document_type in REQUIRED_USER_DOCUMENT_TYPES:
        existing = db.exec(
            select(UserDocument).where(
                UserDocument.user_id == user.id,
                UserDocument.document_type == document_type.value,
            )
        ).first()
        if existing is None:
            db.add(
                UserDocument(
                    user_id=user.id,
                    document_type=document_type.value,
                    filename=f"{document_type.value}.pdf",
                )
            )
    db.commit()


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
    _prepare_user_for_campaigns(db, settings.EMAIL_TEST_USER)

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
    assert past_response.json()["detail"] == "Start date must be today"

    future_response = client.post(
        f"{settings.API_V1_STR}/user-campaigns/",
        headers=normal_user_token_headers,
        json={
            **start_payload,
            "start_date": (today + timedelta(days=1)).isoformat(),
        },
    )
    assert future_response.status_code == 400
    assert future_response.json()["detail"] == "Start date must be today"

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

    market_response = client.get(
        f"{settings.API_V1_STR}/campaigns/",
        headers=normal_user_token_headers,
    )
    assert market_response.status_code == 200
    assert all(item["id"] != campaign_id for item in market_response.json()["data"])

    hidden_response = client.get(
        f"{settings.API_V1_STR}/campaigns/{campaign_id}",
        headers=normal_user_token_headers,
    )
    assert hidden_response.status_code == 404

    restart_response = client.post(
        f"{settings.API_V1_STR}/user-campaigns/",
        headers=normal_user_token_headers,
        json=start_payload,
    )
    assert restart_response.status_code == 404

    history_response = client.get(
        f"{settings.API_V1_STR}/user-campaigns/",
        headers=normal_user_token_headers,
    )
    assert history_response.status_code == 200
    history = next(
        item for item in history_response.json()["data"] if item["id"] == started["id"]
    )
    assert history["campaign"]["title"] == "User campaign source"

    _purge_campaign(db, campaign_id)
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
    _prepare_user_for_campaigns(db, settings.EMAIL_TEST_USER)

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
    _purge_campaign(db, campaign_id)
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
    _prepare_user_for_campaigns(db, settings.EMAIL_TEST_USER)

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
    _purge_campaign(db, campaign_id)
    db_category = db.get(Category, category.id)
    if db_category is not None:
        db.delete(db_category)
        db.commit()


def _start_payload(campaign_id: str) -> dict[str, object]:
    today = datetime.now(timezone.utc).date()
    return {
        "campaign_id": campaign_id,
        "start_date": today.isoformat(),
        "end_date": (today + timedelta(days=30)).isoformat(),
        "budget": 250,
    }


def test_user_cannot_start_campaign_with_incomplete_profile(
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
    campaign_id = create_response.json()["id"]
    _set_user_available_balance(db, settings.EMAIL_TEST_USER, Decimal("1000"))

    user = crud.get_user_by_email(session=db, email=settings.EMAIL_TEST_USER)
    assert user is not None
    user.city = ""
    user.address_line_one = ""
    db.add(user)
    db.commit()

    start_response = client.post(
        f"{settings.API_V1_STR}/user-campaigns/",
        headers=normal_user_token_headers,
        json=_start_payload(campaign_id),
    )
    assert start_response.status_code == 400
    assert start_response.json()["detail"] == crud.PROFILE_INCOMPLETE_DETAIL


def test_user_cannot_start_campaign_without_documents(
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
    campaign_id = create_response.json()["id"]
    _set_user_available_balance(db, settings.EMAIL_TEST_USER, Decimal("1000"))
    _prepare_user_for_campaigns(db, settings.EMAIL_TEST_USER)

    user = crud.get_user_by_email(session=db, email=settings.EMAIL_TEST_USER)
    assert user is not None
    documents = db.exec(
        select(UserDocument).where(UserDocument.user_id == user.id)
    ).all()
    for document in documents:
        db.delete(document)
    db.commit()

    start_response = client.post(
        f"{settings.API_V1_STR}/user-campaigns/",
        headers=normal_user_token_headers,
        json=_start_payload(campaign_id),
    )
    assert start_response.status_code == 400
    assert start_response.json()["detail"] == crud.DOCUMENTS_MISSING_DETAIL


def test_superuser_lists_campaigns_for_user(
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
        json=_campaign_payload(str(category.id), title="Client campaign"),
    )
    assert create_response.status_code == 200
    campaign_id = create_response.json()["id"]
    _set_user_available_balance(db, settings.EMAIL_TEST_USER, Decimal("1000"))
    _prepare_user_for_campaigns(db, settings.EMAIL_TEST_USER)

    start_response = client.post(
        f"{settings.API_V1_STR}/user-campaigns/",
        headers=normal_user_token_headers,
        json=_start_payload(campaign_id),
    )
    assert start_response.status_code == 200
    started_id = start_response.json()["id"]

    user = crud.get_user_by_email(session=db, email=settings.EMAIL_TEST_USER)
    assert user is not None

    forbidden = client.get(
        f"{settings.API_V1_STR}/user-campaigns/user/{user.id}",
        headers=normal_user_token_headers,
    )
    assert forbidden.status_code == 403

    missing = client.get(
        f"{settings.API_V1_STR}/user-campaigns/user/{uuid4()}",
        headers=superuser_token_headers,
    )
    assert missing.status_code == 404

    listed = client.get(
        f"{settings.API_V1_STR}/user-campaigns/user/{user.id}",
        headers=superuser_token_headers,
    )
    assert listed.status_code == 200
    body = listed.json()
    assert body["count"] >= 1
    match = next(item for item in body["data"] if item["id"] == started_id)
    assert match["campaign"]["title"] == "Client campaign"
    assert match["user_id"] == str(user.id)


def test_account_participation_follows_type_and_updates_running_campaigns(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    normal_user_token_headers: dict[str, str],
    db: Session,
) -> None:
    user = crud.get_user_by_email(session=db, email=settings.EMAIL_TEST_USER)
    assert user is not None
    account = db.exec(select(Account).where(Account.user_id == user.id)).one()
    original_type = account.account_type
    original_participation = account.participation

    category = crud.create_category(
        session=db,
        category_in=CategoryCreate(name=f"participation-{uuid4().hex[:8]}"),
    )
    create_response = client.post(
        f"{settings.API_V1_STR}/campaigns/",
        headers=superuser_token_headers,
        json=_campaign_payload(str(category.id), title="Participation source"),
    )
    assert create_response.status_code == 200
    campaign_id = create_response.json()["id"]
    _set_user_available_balance(db, settings.EMAIL_TEST_USER, Decimal("1000"))
    _prepare_user_for_campaigns(db, settings.EMAIL_TEST_USER)

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
    assert start_response.status_code == 200
    started_id = start_response.json()["id"]

    try:
        typed = client.patch(
            f"{settings.API_V1_STR}/users/{user.id}/account",
            headers=superuser_token_headers,
            json={"account_type": AccountType.ACCELERATOR.value},
        )
        assert typed.status_code == 200
        assert typed.json()["account_type"] == AccountType.ACCELERATOR.value
        assert typed.json()["participation"] == 23

        running = client.get(
            f"{settings.API_V1_STR}/user-campaigns/{started_id}",
            headers=normal_user_token_headers,
        )
        assert running.status_code == 200
        assert running.json()["participation"] == 23
        assert running.json()["status"] == "active"

        custom = client.patch(
            f"{settings.API_V1_STR}/users/{user.id}/account",
            headers=superuser_token_headers,
            json={"participation": 15},
        )
        assert custom.status_code == 200
        assert custom.json()["account_type"] == AccountType.ACCELERATOR.value
        assert custom.json()["participation"] == 15

        running = client.get(
            f"{settings.API_V1_STR}/user-campaigns/{started_id}",
            headers=normal_user_token_headers,
        )
        assert running.json()["participation"] == 15

        row = db.get(UserCampaign, UUID(started_id))
        assert row is not None
        row.created_at = datetime.now(timezone.utc) - timedelta(minutes=6)
        db.add(row)
        db.commit()
        settled = client.get(
            f"{settings.API_V1_STR}/user-campaigns/{started_id}",
            headers=normal_user_token_headers,
        )
        assert settled.status_code == 200
        assert settled.json()["status"] == "completed"
        assert settled.json()["participation"] == 15

        after = client.patch(
            f"{settings.API_V1_STR}/users/{user.id}/account",
            headers=superuser_token_headers,
            json={"participation": 40},
        )
        assert after.status_code == 200
        finished = client.get(
            f"{settings.API_V1_STR}/user-campaigns/{started_id}",
            headers=normal_user_token_headers,
        )
        assert finished.json()["participation"] == 15
    finally:
        client.patch(
            f"{settings.API_V1_STR}/users/{user.id}/account",
            headers=superuser_token_headers,
            json={
                "account_type": original_type.value,
                "participation": original_participation,
            },
        )
        _purge_campaign(db, campaign_id)
        db_category = db.get(Category, category.id)
        if db_category is not None:
            db.delete(db_category)
            db.commit()
