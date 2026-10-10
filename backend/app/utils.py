import logging
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import emails  # type: ignore[import-untyped]
import jwt
from jinja2 import Template
from jwt.exceptions import InvalidTokenError

from app.activation_email_copy import activation_email_copy, normalize_activation_language
from app.core import security
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class EmailData:
    html_content: str
    subject: str


def render_email_template(*, template_name: str, context: dict[str, Any]) -> str:
    template_str = (
        Path(__file__).parent / "email-templates" / "build" / template_name
    ).read_text()
    html_content = Template(template_str).render(context)
    return html_content


def send_email(
    *,
    email_to: str,
    subject: str = "",
    html_content: str = "",
    inline_images: list[tuple[str, bytes]] | None = None,
) -> None:
    assert settings.emails_enabled, "no provided configuration for email variables"
    message = emails.Message(
        subject=subject,
        html=html_content,
        mail_from=(settings.EMAILS_FROM_NAME, settings.EMAILS_FROM_EMAIL),
    )
    for content_id, data in inline_images or []:
        message.attach(
            filename=content_id,
            data=data,
            mime_type="image/png",
            content_disposition="inline",
            content_id=content_id,
        )
    smtp_options = {"host": settings.SMTP_HOST, "port": settings.SMTP_PORT}
    if settings.SMTP_USER:
        smtp_options["user"] = settings.SMTP_USER
    if settings.SMTP_PASSWORD:
        smtp_options["password"] = settings.SMTP_PASSWORD
    response = message.send(to=email_to, smtp=smtp_options)
    logger.info(f"send email result: {response}")


def generate_test_email(email_to: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Test email"
    html_content = render_email_template(
        template_name="test_email.html",
        context={"project_name": settings.PROJECT_NAME, "email": email_to},
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_reset_password_email(email_to: str, email: str, token: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Password recovery for user {email}"
    link = f"{settings.FRONTEND_HOST}/reset-password?token={token}"
    html_content = render_email_template(
        template_name="reset_password.html",
        context={
            "project_name": settings.PROJECT_NAME,
            "username": email,
            "email": email_to,
            "valid_hours": settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS,
            "link": link,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_new_account_email(
    email_to: str, username: str, password: str
) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - New account for user {username}"
    html_content = render_email_template(
        template_name="new_account.html",
        context={
            "project_name": settings.PROJECT_NAME,
            "username": username,
            "password": password,
            "email": email_to,
            "link": settings.FRONTEND_HOST,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


ACTIVATION_LOGO_CONTENT_ID = "sidlee-logo.png"


def activation_logo_bytes() -> bytes:
    return (
        Path(__file__).parent / "email-templates" / "assets" / ACTIVATION_LOGO_CONTENT_ID
    ).read_bytes()


def generate_activation_email(
    email_to: str, username: str, token: str, language: str = "en"
) -> EmailData:
    copy = activation_email_copy(language)
    link = f"{settings.FRONTEND_HOST}/activate?token={token}"
    html_content = render_email_template(
        template_name="activation_email.html",
        context={
            "project_name": settings.PROJECT_NAME,
            "username": username,
            "email": email_to,
            "link": link,
            "valid_hours": 72,
            "language": normalize_activation_language(language),
            **copy,
        },
    )
    return EmailData(html_content=html_content, subject=copy["subject"])


def send_activation_email(
    *, email_to: str, username: str, token: str, language: str = "en"
) -> None:
    email_data = generate_activation_email(
        email_to=email_to, username=username, token=token, language=language
    )
    send_email(
        email_to=email_to,
        subject=email_data.subject,
        html_content=email_data.html_content,
        inline_images=[(ACTIVATION_LOGO_CONTENT_ID, activation_logo_bytes())],
    )


def generate_activation_token(email: str) -> str:
    delta = timedelta(hours=72)
    now = datetime.now(timezone.utc)
    exp = (now + delta).timestamp()
    return jwt.encode(
        {"exp": exp, "nbf": now, "sub": email, "type": "activation"},
        settings.SECRET_KEY,
        algorithm=security.ALGORITHM,
    )


def verify_activation_token(token: str) -> str | None:
    try:
        decoded = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        if decoded.get("type") != "activation":
            return None
        return str(decoded["sub"])
    except InvalidTokenError:
        return None


def generate_password_reset_token(email: str) -> str:
    delta = timedelta(hours=settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS)
    now = datetime.now(timezone.utc)
    expires = now + delta
    exp = expires.timestamp()
    encoded_jwt = jwt.encode(
        {"exp": exp, "nbf": now, "sub": email},
        settings.SECRET_KEY,
        algorithm=security.ALGORITHM,
    )
    return encoded_jwt


def verify_password_reset_token(token: str) -> str | None:
    try:
        decoded_token = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        return str(decoded_token["sub"])
    except InvalidTokenError:
        return None
