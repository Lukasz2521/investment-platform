import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app import crud
from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.core.storage import delete_bank_logo, save_bank_logo_from_upload
from app.models import (
    Bank,
    BankCreate,
    BankPublic,
    BanksPublic,
    BankUpdate,
    Message,
)

router = APIRouter(prefix="/banks", tags=["banks"])


def _save_logo(logo: UploadFile | None, *, previous: str = "") -> str:
    try:
        return save_bank_logo_from_upload(logo, previous=previous)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
)
def create_bank(
    *,
    session: SessionDep,
    name: str = Form(),
    bank_address: str = Form(""),
    account_name: str = Form(""),
    iban: str = Form(""),
    sepa: str = Form(""),
    swift: str = Form(""),
    company_address: str = Form(""),
    transfer_title: str = Form(""),
    bank_description: str | None = Form(None),
    logo: UploadFile | None = File(None),
) -> BankPublic:
    """
    Create a new bank. Superuser only.
    """
    bank_in = BankCreate(
        name=name,
        bank_address=bank_address,
        account_name=account_name,
        iban=iban,
        sepa=sepa,
        swift=swift,
        company_address=company_address,
        transfer_title=transfer_title,
        bank_description=bank_description or None,
        bank_logo=_save_logo(logo),
    )
    bank = crud.create_bank(session=session, bank_in=bank_in)
    return BankPublic.model_validate(bank)


@router.get("/", response_model=BanksPublic)
def get_banks(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> BanksPublic:
    """
    Get all banks. Available to any authenticated user.
    """
    _ = current_user
    banks, count = crud.get_banks(session=session, skip=skip, limit=limit)
    data = [BankPublic.model_validate(bank) for bank in banks]
    return BanksPublic(data=data, count=count)


@router.get("/{bank_id}", response_model=BankPublic)
def get_bank(
    session: SessionDep,
    current_user: CurrentUser,
    bank_id: uuid.UUID,
) -> BankPublic:
    """
    Get a bank by id. Available to any authenticated user.
    """
    _ = current_user
    bank = session.get(Bank, bank_id)
    if not bank:
        raise HTTPException(status_code=404, detail="Bank not found")
    return BankPublic.model_validate(bank)


@router.put(
    "/{bank_id}",
    dependencies=[Depends(get_current_active_superuser)],
)
def update_bank(
    *,
    session: SessionDep,
    bank_id: uuid.UUID,
    name: str | None = Form(None),
    bank_address: str | None = Form(None),
    account_name: str | None = Form(None),
    iban: str | None = Form(None),
    sepa: str | None = Form(None),
    swift: str | None = Form(None),
    company_address: str | None = Form(None),
    transfer_title: str | None = Form(None),
    bank_description: str | None = Form(None),
    remove_logo: bool = Form(False),
    logo: UploadFile | None = File(None),
) -> BankPublic:
    """
    Update a bank. Superuser only.
    """
    bank = session.get(Bank, bank_id)
    if not bank:
        raise HTTPException(status_code=404, detail="Bank not found")

    if remove_logo:
        delete_bank_logo(bank.bank_logo)
        bank_logo = ""
    else:
        bank_logo = _save_logo(logo, previous=bank.bank_logo)

    update_fields: dict[str, str | None] = {"bank_logo": bank_logo}
    for key, value in (
        ("name", name),
        ("bank_address", bank_address),
        ("account_name", account_name),
        ("iban", iban),
        ("sepa", sepa),
        ("swift", swift),
        ("company_address", company_address),
        ("transfer_title", transfer_title),
    ):
        if value is not None:
            update_fields[key] = value
    if bank_description is not None:
        update_fields["bank_description"] = bank_description or None

    bank_in = BankUpdate.model_validate(update_fields)
    bank = crud.update_bank(session=session, db_bank=bank, bank_in=bank_in)
    return BankPublic.model_validate(bank)


@router.delete(
    "/{bank_id}",
    dependencies=[Depends(get_current_active_superuser)],
)
def remove_bank(
    *,
    session: SessionDep,
    bank_id: uuid.UUID,
) -> Message:
    """
    Remove a bank. Superuser only.
    """
    bank = session.get(Bank, bank_id)
    if not bank:
        raise HTTPException(status_code=404, detail="Bank not found")
    logo_filename = bank.bank_logo
    session.delete(bank)
    session.commit()
    delete_bank_logo(logo_filename)
    return Message(message="Bank deleted successfully")
