import uuid
from pathlib import Path

from fastapi import UploadFile

MAX_BANK_LOGO_BYTES = 2 * 1024 * 1024

_CONTENT_TYPE_TO_EXT = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


def get_uploads_root() -> Path:
    return Path(__file__).resolve().parent.parent.parent / "uploads"


def get_bank_logos_dir() -> Path:
    return get_uploads_root() / "banks"


def ensure_upload_dirs() -> Path:
    logos_dir = get_bank_logos_dir()
    logos_dir.mkdir(parents=True, exist_ok=True)
    return logos_dir


def sniff_image_content_type(data: bytes) -> str | None:
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if data.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if data.startswith((b"GIF87a", b"GIF89a")):
        return "image/gif"
    if len(data) >= 12 and data.startswith(b"RIFF") and data[8:12] == b"WEBP":
        return "image/webp"
    return None


def logo_filename(stored: str) -> str:
    if not stored:
        return ""
    return stored.rsplit("/", 1)[-1]


def save_bank_logo_from_bytes(raw: bytes) -> str:
    if len(raw) > MAX_BANK_LOGO_BYTES:
        raise ValueError("Bank logo is too large (max 2 MB)")

    sniffed = sniff_image_content_type(raw)
    if sniffed is None:
        raise ValueError("Unsupported bank logo format")

    filename = f"{uuid.uuid4()}{_CONTENT_TYPE_TO_EXT[sniffed]}"
    target = ensure_upload_dirs() / filename
    target.write_bytes(raw)
    return filename


def save_bank_logo_from_upload(logo: UploadFile | None, *, previous: str = "") -> str:
    if logo is None or not logo.filename:
        return previous

    raw = logo.file.read()
    if not raw:
        return previous

    filename = save_bank_logo_from_bytes(raw)
    if previous and previous != filename:
        delete_bank_logo(previous)
    return filename


def delete_bank_logo(stored: str) -> None:
    filename = logo_filename(stored)
    if not filename or "/" in filename or "\\" in filename or filename.startswith("."):
        return

    path = get_bank_logos_dir() / filename
    try:
        path.relative_to(get_bank_logos_dir())
    except ValueError:
        return
    path.unlink(missing_ok=True)
