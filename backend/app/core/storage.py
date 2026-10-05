import uuid
from pathlib import Path

from fastapi import UploadFile

MAX_BANK_LOGO_BYTES = 2 * 1024 * 1024
MAX_CAMPAIGN_VIDEO_BYTES = 15 * 1024 * 1024
MAX_USER_DOCUMENT_BYTES = 10 * 1024 * 1024

_CONTENT_TYPE_TO_EXT = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "application/pdf": ".pdf",
}


def get_uploads_root() -> Path:
    return Path(__file__).resolve().parent.parent.parent / "uploads"


def get_bank_logos_dir() -> Path:
    return get_uploads_root() / "banks"


def get_campaign_videos_dir() -> Path:
    return get_uploads_root() / "campaigns"


def get_user_documents_dir() -> Path:
    return get_uploads_root() / "user-documents"


def ensure_upload_dirs() -> Path:
    logos_dir = get_bank_logos_dir()
    logos_dir.mkdir(parents=True, exist_ok=True)
    get_campaign_videos_dir().mkdir(parents=True, exist_ok=True)
    get_user_documents_dir().mkdir(parents=True, exist_ok=True)
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
        raise ValueError("Campaign video is too large (max 15 MB)")
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


def sniff_document_content_type(data: bytes) -> str | None:
    if data.startswith(b"%PDF"):
        return "application/pdf"
    return sniff_image_content_type(data)


def save_user_document_from_bytes(raw: bytes) -> str:
    if len(raw) > MAX_USER_DOCUMENT_BYTES:
        raise ValueError("Document is too large (max 10 MB)")

    sniffed = sniff_document_content_type(raw)
    if sniffed is None or sniffed not in _CONTENT_TYPE_TO_EXT:
        raise ValueError("Unsupported document format")

    filename = f"{uuid.uuid4()}{_CONTENT_TYPE_TO_EXT[sniffed]}"
    target_dir = get_user_documents_dir()
    target_dir.mkdir(parents=True, exist_ok=True)
    (target_dir / filename).write_bytes(raw)
    return filename


def save_user_document_from_upload(upload: UploadFile, *, previous: str = "") -> str:
    raw = upload.file.read()
    if not raw:
        raise ValueError("Empty document")

    filename = save_user_document_from_bytes(raw)
    if previous and previous != filename:
        delete_user_document_file(previous)
    return filename


def delete_user_document_file(stored: str) -> None:
    filename = logo_filename(stored)
    if not filename or "/" in filename or "\\" in filename or filename.startswith("."):
        return

    directory = get_user_documents_dir()
    path = directory / filename
    try:
        path.relative_to(directory)
    except ValueError:
        return
    path.unlink(missing_ok=True)


def resolve_user_document_path(stored: str) -> Path | None:
    filename = logo_filename(stored)
    if not filename or "/" in filename or "\\" in filename or filename.startswith("."):
        return None

    directory = get_user_documents_dir()
    path = directory / filename
    try:
        path.relative_to(directory)
    except ValueError:
        return None
    if not path.is_file():
        return None
    return path


def user_document_content_type(filename: str) -> str:
    return {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".gif": "image/gif",
        ".pdf": "application/pdf",
    }.get(Path(filename).suffix.lower(), "application/octet-stream")
