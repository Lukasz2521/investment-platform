import uuid
from datetime import datetime, timezone

from fastapi.testclient import TestClient

from app.core.config import settings


def test_read_news_public(client: TestClient) -> None:
    response = client.get(f"{settings.API_V1_STR}/news/")
    assert response.status_code == 200
    content = response.json()
    assert "data" in content
    assert "count" in content
    assert isinstance(content["data"], list)


def test_create_news_requires_auth(client: TestClient) -> None:
    response = client.post(
        f"{settings.API_V1_STR}/news/",
        json={"title": "Launch", "description": "Platform is live."},
    )
    assert response.status_code == 401


def test_create_news_requires_superuser(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    response = client.post(
        f"{settings.API_V1_STR}/news/",
        headers=normal_user_token_headers,
        json={"title": "Launch", "description": "Platform is live."},
    )
    assert response.status_code == 403


def test_news_crud(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    create_response = client.post(
        f"{settings.API_V1_STR}/news/",
        headers=superuser_token_headers,
        json={
            "title": "Platforma inwestycyjna startuje",
            "description": "Aplikacja kliencka jest dostępna.",
            "published_at": "2026-08-18",
        },
    )
    assert create_response.status_code == 200
    created = create_response.json()
    news_id = created["id"]
    assert created["title"] == "Platforma inwestycyjna startuje"
    assert created["description"] == "Aplikacja kliencka jest dostępna."
    assert created["published_at"] == "2026-08-18"

    list_response = client.get(f"{settings.API_V1_STR}/news/")
    assert list_response.status_code == 200
    listed = list_response.json()
    assert listed["count"] >= 1
    assert any(item["id"] == news_id for item in listed["data"])

    update_response = client.put(
        f"{settings.API_V1_STR}/news/{news_id}",
        headers=superuser_token_headers,
        json={"title": "Nowe rynki i formaty kampanii"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["title"] == "Nowe rynki i formaty kampanii"
    assert update_response.json()["published_at"] == "2026-08-18"

    delete_response = client.delete(
        f"{settings.API_V1_STR}/news/{news_id}",
        headers=superuser_token_headers,
    )
    assert delete_response.status_code == 200

    missing_response = client.put(
        f"{settings.API_V1_STR}/news/{uuid.uuid4()}",
        headers=superuser_token_headers,
        json={"title": "Missing"},
    )
    assert missing_response.status_code == 404


def test_create_news_defaults_published_at(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.post(
        f"{settings.API_V1_STR}/news/",
        headers=superuser_token_headers,
        json={"title": "Today", "description": "Published now."},
    )
    assert response.status_code == 200
    content = response.json()
    assert content["published_at"] == datetime.now(timezone.utc).date().isoformat()
