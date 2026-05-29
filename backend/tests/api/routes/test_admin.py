from fastapi.testclient import TestClient
from sqlmodel import Session

from app import crud
from app.core.config import settings
from app.models import UserCreate
from tests.utils.utils import random_email, random_lower_string


def test_admin_login_superuser(client: TestClient) -> None:
    r = client.post(
        f"{settings.API_V1_STR}/admin/login",
        json={
            "email": settings.FIRST_SUPERUSER,
            "password": settings.FIRST_SUPERUSER_PASSWORD,
        },
    )
    assert r.status_code == 200
    content = r.json()
    assert "access_token" in content
    assert content["token_type"] == "bearer"


def test_admin_login_wrong_password(client: TestClient) -> None:
    r = client.post(
        f"{settings.API_V1_STR}/admin/login",
        json={
            "email": settings.FIRST_SUPERUSER,
            "password": "wrong-password",
        },
    )
    assert r.status_code == 400
    assert r.json()["detail"] == "Incorrect email or password"


def test_admin_login_rejects_normal_user(client: TestClient, db: Session) -> None:
    email = random_email()
    password = random_lower_string()
    user_in = UserCreate(email=email, password=password)
    crud.create_user(session=db, user_create=user_in)

    r = client.post(
        f"{settings.API_V1_STR}/admin/login",
        json={"email": email, "password": password},
    )
    assert r.status_code == 400
    assert r.json()["detail"] == "Incorrect email or password"


def test_admin_login_unknown_email(client: TestClient) -> None:
    r = client.post(
        f"{settings.API_V1_STR}/admin/login",
        json={"email": "nobody@example.com", "password": "any-password-123"},
    )
    assert r.status_code == 400
    assert r.json()["detail"] == "Incorrect email or password"
