from app.core.config import settings
from app.utils import (
    ACTIVATION_LOGO_CONTENT_ID,
    activation_logo_bytes,
    generate_activation_email,
)


def test_activation_email_contains_logo_and_polish_copy() -> None:
    email = generate_activation_email(
        "anna@example.com", "anna", "activation-token", language="pl"
    )

    assert email.subject == "SidLee Media - Aktywacja konta"
    assert 'lang="pl"' in email.html_content
    assert "cid:sidlee-logo.png" in email.html_content
    assert "Dzień dobry," in email.html_content
    assert "dziękujemy za rejestrację na Naszej platformie SidLee Media." in email.html_content
    assert "POTWIERDŹ I AKTYWUJ KONTO" in email.html_content
    assert "Zespół SidLee Media" in email.html_content
    assert "Support SidLee Media" in email.html_content
    assert "1 Place Ville Marie, Montreal, Quebec H3B 3Y1, Kanada." in email.html_content
    assert "+1 514 282-2200 (KA)" in email.html_content
    assert "+48 519 236 488 (PL)" in email.html_content
    assert "support@sidlee-media.com" in email.html_content
    assert "background-color:#000000" in email.html_content
    assert (
        f"{settings.FRONTEND_HOST}/activate?token=activation-token" in email.html_content
    )


def test_activation_email_follows_selected_language() -> None:
    english = generate_activation_email(
        "anna@example.com", "anna", "activation-token", language="en"
    )
    german = generate_activation_email(
        "anna@example.com", "anna", "activation-token", language="de-DE"
    )
    unknown = generate_activation_email(
        "anna@example.com", "anna", "activation-token", language="xx"
    )

    assert english.subject == "SidLee Media - Activate your account"
    assert "CONFIRM AND ACTIVATE ACCOUNT" in english.html_content
    assert "Address: 1 Place Ville Marie, Montreal, Quebec H3B 3Y1, Canada." in english.html_content
    assert german.subject == "SidLee Media - Konto aktivieren"
    assert "BESTÄTIGEN UND KONTO AKTIVIEREN" in german.html_content
    assert unknown.subject == english.subject


def test_activation_logo_is_attached_inline() -> None:
    import emails

    logo = activation_logo_bytes()
    assert logo.startswith(b"\x89PNG")

    message = emails.Message(
        subject="SidLee Media - Aktywacja konta",
        html='<img src="cid:sidlee-logo.png" alt="SidLee Media">',
        mail_from=("SidLee Media", "noreply@example.com"),
    )
    message.attach(
        filename=ACTIVATION_LOGO_CONTENT_ID,
        data=logo,
        mime_type="image/png",
        content_disposition="inline",
        content_id=ACTIVATION_LOGO_CONTENT_ID,
    )
    raw = message.as_string()
    assert "Content-ID: <sidlee-logo.png>" in raw
    assert "Content-Disposition: inline" in raw

