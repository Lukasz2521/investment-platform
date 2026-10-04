from decimal import Decimal

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app import crud
from app.core.config import settings
from app.models import Account


def _account_for_email(db: Session, email: str) -> Account:
    user = crud.get_user_by_email(session=db, email=email)
    assert user is not None
    account = db.exec(select(Account).where(Account.user_id == user.id)).first()
    assert account is not None
    return account


def _create_deposit(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    *,
    user_id: str,
    amount: str,
    status: str,
) -> dict[str, object]:
    response = client.post(
        f"{settings.API_V1_STR}/transactions/",
        headers=superuser_token_headers,
        json={
            "amount": amount,
            "transaction_type": "deposit",
            "status": status,
            "user_id": user_id,
            "description": "Admin deposit",
        },
    )
    assert response.status_code == 200
    return response.json()


def test_admin_deposit_pending_is_visible_without_changing_balance(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    normal_user_token_headers: dict[str, str],
    db: Session,
) -> None:
    me = client.get(f"{settings.API_V1_STR}/users/me", headers=normal_user_token_headers)
    assert me.status_code == 200
    user_id = me.json()["id"]
    account = _account_for_email(db, settings.EMAIL_TEST_USER)
    before_available = account.available_balance
    before_deposits = account.total_deposit

    created = _create_deposit(
        client,
        superuser_token_headers,
        user_id=user_id,
        amount="150.50",
        status="pending",
    )
    assert created["status"] == "pending"
    assert created["transaction_type"] == "deposit"

    db.refresh(account)
    assert account.available_balance == before_available
    assert account.total_deposit == before_deposits

    mine = client.get(
        f"{settings.API_V1_STR}/transactions/me",
        headers=normal_user_token_headers,
    )
    assert mine.status_code == 200
    assert any(item["id"] == created["id"] for item in mine.json()["data"])


def test_admin_deposit_failed_does_not_change_balance(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    normal_user_token_headers: dict[str, str],
    db: Session,
) -> None:
    me = client.get(f"{settings.API_V1_STR}/users/me", headers=normal_user_token_headers)
    user_id = me.json()["id"]
    account = _account_for_email(db, settings.EMAIL_TEST_USER)
    before_available = account.available_balance

    _create_deposit(
        client,
        superuser_token_headers,
        user_id=user_id,
        amount="80",
        status="failed",
    )

    db.refresh(account)
    assert account.available_balance == before_available


def test_admin_deposit_done_credits_available_balance(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    normal_user_token_headers: dict[str, str],
    db: Session,
) -> None:
    me = client.get(f"{settings.API_V1_STR}/users/me", headers=normal_user_token_headers)
    user_id = me.json()["id"]
    account = _account_for_email(db, settings.EMAIL_TEST_USER)
    before_available = account.available_balance
    before_deposits = account.total_deposit

    created = _create_deposit(
        client,
        superuser_token_headers,
        user_id=user_id,
        amount="200",
        status="done",
    )
    assert created["status"] == "done"

    db.refresh(account)
    assert account.available_balance == before_available + Decimal("200")
    assert account.total_deposit == before_deposits + Decimal("200")


def test_admin_updating_deposit_to_done_credits_balance(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    normal_user_token_headers: dict[str, str],
    db: Session,
) -> None:
    me = client.get(f"{settings.API_V1_STR}/users/me", headers=normal_user_token_headers)
    user_id = me.json()["id"]
    account = _account_for_email(db, settings.EMAIL_TEST_USER)
    before_available = account.available_balance

    created = _create_deposit(
        client,
        superuser_token_headers,
        user_id=user_id,
        amount="75",
        status="pending",
    )

    updated = client.put(
        f"{settings.API_V1_STR}/transactions/{created['id']}",
        headers=superuser_token_headers,
        json={"status": "done", "description": "Approved deposit"},
    )
    assert updated.status_code == 200
    assert updated.json()["status"] == "done"

    db.refresh(account)
    assert account.available_balance == before_available + Decimal("75")


def test_admin_reverting_done_deposit_removes_balance(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    normal_user_token_headers: dict[str, str],
    db: Session,
) -> None:
    me = client.get(f"{settings.API_V1_STR}/users/me", headers=normal_user_token_headers)
    user_id = me.json()["id"]
    account = _account_for_email(db, settings.EMAIL_TEST_USER)
    before_available = account.available_balance

    created = _create_deposit(
        client,
        superuser_token_headers,
        user_id=user_id,
        amount="40",
        status="done",
    )

    reverted = client.put(
        f"{settings.API_V1_STR}/transactions/{created['id']}",
        headers=superuser_token_headers,
        json={"status": "failed", "description": "Rejected"},
    )
    assert reverted.status_code == 200

    db.refresh(account)
    assert account.available_balance == before_available


def test_admin_can_create_negative_amount_transaction(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    normal_user_token_headers: dict[str, str],
    db: Session,
) -> None:
    me = client.get(f"{settings.API_V1_STR}/users/me", headers=normal_user_token_headers)
    user_id = me.json()["id"]
    account = _account_for_email(db, settings.EMAIL_TEST_USER)
    before_available = account.available_balance
    before_deposits = account.total_deposit

    zero = client.post(
        f"{settings.API_V1_STR}/transactions/",
        headers=superuser_token_headers,
        json={
            "amount": "0",
            "transaction_type": "deposit",
            "status": "pending",
            "user_id": user_id,
        },
    )
    assert zero.status_code == 422

    pending = _create_deposit(
        client,
        superuser_token_headers,
        user_id=user_id,
        amount="-50.25",
        status="pending",
    )
    assert Decimal(str(pending["amount"])) == Decimal("-50.25")

    db.refresh(account)
    assert account.available_balance == before_available
    assert account.total_deposit == before_deposits

    created = _create_deposit(
        client,
        superuser_token_headers,
        user_id=user_id,
        amount="-50.25",
        status="done",
    )
    assert Decimal(str(created["amount"])) == Decimal("-50.25")
    assert created["status"] == "done"

    db.refresh(account)
    assert account.available_balance == before_available + Decimal("-50.25")
    assert account.total_deposit == max(Decimal("0"), before_deposits + Decimal("-50.25"))


def _request_withdraw(
    client: TestClient,
    token_headers: dict[str, str],
    *,
    amount: str,
) -> object:
    return client.post(
        f"{settings.API_V1_STR}/transactions/me/withdraw",
        headers=token_headers,
        json={
            "amount": amount,
            "account_holder_name": "Jan Kowalski",
            "payment_purpose": "Personal withdrawal",
            "transfer_type": "sepa",
            "sepa_address": "PL61109010140000071219812874",
            "bank_address": "Test Bank",
        },
    )


def test_user_withdraw_pending_deducts_available_balance(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    normal_user_token_headers: dict[str, str],
    db: Session,
) -> None:
    me = client.get(f"{settings.API_V1_STR}/users/me", headers=normal_user_token_headers)
    user_id = me.json()["id"]
    _create_deposit(
        client,
        superuser_token_headers,
        user_id=user_id,
        amount="100",
        status="done",
    )
    account = _account_for_email(db, settings.EMAIL_TEST_USER)
    db.refresh(account)
    before_available = account.available_balance
    before_withdraw = account.total_withdraw

    response = _request_withdraw(
        client, normal_user_token_headers, amount="40"
    )
    assert response.status_code == 200
    assert response.json()["status"] == "pending"
    assert response.json()["transaction_type"] == "withdraw"

    db.refresh(account)
    assert account.available_balance == before_available - Decimal("40")
    assert account.total_withdraw == before_withdraw


def test_user_withdraw_rejected_when_insufficient_balance(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    normal_user_token_headers: dict[str, str],
    db: Session,
) -> None:
    me = client.get(f"{settings.API_V1_STR}/users/me", headers=normal_user_token_headers)
    user_id = me.json()["id"]
    _create_deposit(
        client,
        superuser_token_headers,
        user_id=user_id,
        amount="10",
        status="done",
    )
    account = _account_for_email(db, settings.EMAIL_TEST_USER)
    db.refresh(account)
    before_available = account.available_balance

    response = _request_withdraw(
        client, normal_user_token_headers, amount="999999"
    )
    assert response.status_code == 400
    assert response.json()["detail"] == crud.INSUFFICIENT_AVAILABLE_BALANCE

    db.refresh(account)
    assert account.available_balance == before_available


def test_admin_failing_pending_withdraw_refunds_balance(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    normal_user_token_headers: dict[str, str],
    db: Session,
) -> None:
    me = client.get(f"{settings.API_V1_STR}/users/me", headers=normal_user_token_headers)
    user_id = me.json()["id"]
    _create_deposit(
        client,
        superuser_token_headers,
        user_id=user_id,
        amount="80",
        status="done",
    )
    account = _account_for_email(db, settings.EMAIL_TEST_USER)
    db.refresh(account)
    after_deposit = account.available_balance
    before_withdraw = account.total_withdraw

    created = _request_withdraw(client, normal_user_token_headers, amount="25")
    assert created.status_code == 200

    db.refresh(account)
    assert account.available_balance == after_deposit - Decimal("25")

    failed = client.put(
        f"{settings.API_V1_STR}/transactions/{created.json()['id']}",
        headers=superuser_token_headers,
        json={"status": "failed", "description": "Rejected withdrawal"},
    )
    assert failed.status_code == 200
    assert failed.json()["status"] == "failed"

    db.refresh(account)
    assert account.available_balance == after_deposit
    assert account.total_withdraw == before_withdraw


def test_admin_completing_pending_withdraw_keeps_funds_deducted(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    normal_user_token_headers: dict[str, str],
    db: Session,
) -> None:
    me = client.get(f"{settings.API_V1_STR}/users/me", headers=normal_user_token_headers)
    user_id = me.json()["id"]
    _create_deposit(
        client,
        superuser_token_headers,
        user_id=user_id,
        amount="90",
        status="done",
    )
    account = _account_for_email(db, settings.EMAIL_TEST_USER)
    db.refresh(account)
    after_deposit = account.available_balance
    before_withdraw = account.total_withdraw

    created = _request_withdraw(client, normal_user_token_headers, amount="30")
    assert created.status_code == 200

    completed = client.put(
        f"{settings.API_V1_STR}/transactions/{created.json()['id']}",
        headers=superuser_token_headers,
        json={"status": "done", "description": "Paid out"},
    )
    assert completed.status_code == 200
    assert completed.json()["status"] == "done"

    db.refresh(account)
    assert account.available_balance == after_deposit - Decimal("30")
    assert account.total_withdraw == before_withdraw + Decimal("30")


def test_superuser_lists_user_withdrawals(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    normal_user_token_headers: dict[str, str],
) -> None:
    me = client.get(f"{settings.API_V1_STR}/users/me", headers=normal_user_token_headers)
    user_id = me.json()["id"]
    _create_deposit(
        client,
        superuser_token_headers,
        user_id=user_id,
        amount="80",
        status="done",
    )
    created = _request_withdraw(client, normal_user_token_headers, amount="25")
    assert created.status_code == 200
    withdraw_id = created.json()["id"]

    listed = client.get(
        f"{settings.API_V1_STR}/transactions/user/{user_id}",
        headers=superuser_token_headers,
        params={"transaction_type": "withdraw"},
    )
    assert listed.status_code == 200
    body = listed.json()
    assert body["count"] >= 1
    assert all(item["transaction_type"] == "withdraw" for item in body["data"])
    assert any(item["id"] == withdraw_id for item in body["data"])

    forbidden = client.get(
        f"{settings.API_V1_STR}/transactions/user/{user_id}",
        headers=normal_user_token_headers,
        params={"transaction_type": "withdraw"},
    )
    assert forbidden.status_code == 403
