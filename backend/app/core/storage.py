import uuid
from pathlib import Path

from fastapi import UploadFile

MAX_BANK_LOGO_BYTES = 2 * 1024 * 1024
MAX_CAMPAIGN_VIDEO_BYTES = 50 * 1024 * 1024

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


def get_campaign_videos_dir() -> Path:
    return get_uploads_root() / "campaigns"


def ensure_upload_dirs() -> Path:
    logos_dir = get_bank_logos_dir()
    logos_dir.mkdir(parents=True, exist_ok=True)
    get_campaign_videos_dir().mkdir(parents=True, exist_ok=True)
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


def stored_campaign_video_filename(stored: str | None) -> str:
    if not stored:
        return ""

    filename = stored.strip()
    if (
        not filename
        or "/" in filename
        or "\\" in filename
        or ":" in filename
        or filename.startswith(".")
        or not filename.lower().endswith(".mp4")
    ):
        return ""

    return filename


def sniff_mp4(data: bytes) -> bool:
    return len(data) >= 8 and data[4:8] == b"ftyp"


def save_campaign_video_from_bytes(raw: bytes) -> str:
    if len(raw) > MAX_CAMPAIGN_VIDEO_BYTES:
        raise ValueError("Campaign video is too large (max 50 MB)")
    if not sniff_mp4(raw):
        raise ValueError("Unsupported campaign video format. Use MP4.")

    filename = f"{uuid.uuid4()}.mp4"
    target_dir = get_campaign_videos_dir()
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / filename
    target.write_bytes(raw)
    return filename


def save_campaign_video_from_upload(video: UploadFile | None, *, previous: str = "") -> str:
    if video is None or not video.filename:
        return previous

    raw = video.file.read()
    if not raw:
        return previous

    filename = save_campaign_video_from_bytes(raw)
    if previous and previous != filename:
        delete_campaign_video(previous)
    return filename


def delete_campaign_video(stored: str) -> None:
    filename = logo_filename(stored)
    if (
        not filename
        or "/" in filename
        or "\\" in filename
        or filename.startswith(".")
        or not filename.lower().endswith(".mp4")
    ):
        return

    path = get_campaign_videos_dir() / filename
    try:
        path.relative_to(get_campaign_videos_dir())
    except ValueError:
        return
    path.unlink(missing_ok=True)
