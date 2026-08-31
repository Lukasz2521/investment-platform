import base64
import uuid
from pathlib import Path

from fastapi.testclient import TestClient

from app.core.config import settings
from app.core.storage import get_bank_logos_dir
from tests.utils.utils import random_lower_string

TINY_PNG_B64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
TINY_PNG_BYTES = base64.b64decode(TINY_PNG_B64)


def _bank_form(**overrides: str) -> dict[str, str]:
    payload: dict[str, str] = {
        "name": f"Bank {random_lower_string()[:8]}",
        "bank_address": "1 Test Street",
        "account_name": "Test Account",
        "iban": "DE89370400440532013000",
        "sepa": "",
        "swift": "COBADEFF",
        "company_address": "1 Company Street",
        "transfer_title": "Deposit",
    }
    payload.update(overrides)
    return payload


def _logo_path(filename: str) -> Path:
    return get_bank_logos_dir() / filename


def _public_logo_url(filename: str) -> str:
    return f"{settings.API_V1_STR}/uploads/banks/{filename}"


def _assert_filename_only(filename: str) -> None:
    assert filename
    assert "/" not in filename
    assert "\\" not in filename
    stem, ext = filename.rsplit(".", 1)
    uuid.UUID(stem)
    assert ext in {"png", "jpg", "webp", "gif"}


def test_create_bank_with_logo(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.post(
        f"{settings.API_V1_STR}/banks/",
        headers=superuser_token_headers,
        data=_bank_form(),
        files={"logo": ("logo.png", TINY_PNG_BYTES, "image/png")},
    )
    assert response.status_code == 200
    content = response.json()
    filename = content["bank_logo"]
    _assert_filename_only(filename)
    logo_file = _logo_path(filename)
    assert logo_file.is_file()
    assert logo_file.read_bytes() == TINY_PNG_BYTES

    public_response = client.get(_public_logo_url(filename))
    assert public_response.status_code == 200
    assert public_response.content == TINY_PNG_BYTES

    client.delete(
        f"{settings.API_V1_STR}/banks/{content['id']}",
        headers=superuser_token_headers,
    )
    assert not logo_file.exists()


def test_create_bank_without_logo(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.post(
        f"{settings.API_V1_STR}/banks/",
        headers=superuser_token_headers,
        data=_bank_form(),
    )
    assert response.status_code == 200
    content = response.json()
    assert content["bank_logo"] == ""

    client.delete(
        f"{settings.API_V1_STR}/banks/{content['id']}",
        headers=superuser_token_headers,
    )


def test_create_bank_rejects_invalid_logo(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.post(
        f"{settings.API_V1_STR}/banks/",
        headers=superuser_token_headers,
        data=_bank_form(),
        files={"logo": ("logo.png", b"not-an-image", "image/png")},
    )
    assert response.status_code == 400


def test_update_bank_replaces_and_removes_logo(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    created = client.post(
        f"{settings.API_V1_STR}/banks/",
        headers=superuser_token_headers,
        data=_bank_form(),
        files={"logo": ("logo.png", TINY_PNG_BYTES, "image/png")},
    ).json()
    old_filename = created["bank_logo"]
    old_logo = _logo_path(old_filename)
    assert old_logo.is_file()

    updated = client.put(
        f"{settings.API_V1_STR}/banks/{created['id']}",
        headers=superuser_token_headers,
        data=_bank_form(name=created["name"]),
        files={"logo": ("logo.png", TINY_PNG_BYTES, "image/png")},
    )
    assert updated.status_code == 200
    new_filename = updated.json()["bank_logo"]
    _assert_filename_only(new_filename)
    assert new_filename != old_filename
    assert not old_logo.exists()
    assert _logo_path(new_filename).is_file()

    cleared = client.put(
        f"{settings.API_V1_STR}/banks/{created['id']}",
        headers=superuser_token_headers,
        data={"remove_logo": "true"},
    )
    assert cleared.status_code == 200
    assert cleared.json()["bank_logo"] == ""
    assert not _logo_path(new_filename).exists()
    assert cleared.json()["name"] == created["name"]

    client.delete(
        f"{settings.API_V1_STR}/banks/{created['id']}",
        headers=superuser_token_headers,
    )
