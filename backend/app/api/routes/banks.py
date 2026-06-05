import uuid

from fastapi import APIRouter, Depends, HTTPException

from app import crud
from app.api.deps import SessionDep, get_current_active_superuser
from app.models import (
    Bank,
    BankCreate,
    BankPublic,
    BanksPublic,
    BankUpdate,
    Message,
)

router = APIRouter(prefix="/banks", tags=["banks"])


@router.post(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
)
def create_bank(*, session: SessionDep, bank_in: BankCreate) -> BankPublic:
    """
    Create a new bank. Superuser only.
    """
    bank = crud.create_bank(session=session, bank_in=bank_in)
    return BankPublic.model_validate(bank)


@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
)
def get_banks(
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
) -> BanksPublic:
    """
    Get all banks. Superuser only.
    """
    banks, count = crud.get_banks(session=session, skip=skip, limit=limit)
    data = [BankPublic.model_validate(bank) for bank in banks]
    return BanksPublic(data=data, count=count)


@router.put(
    "/{bank_id}",
    dependencies=[Depends(get_current_active_superuser)],
)
def update_bank(
    *,
    session: SessionDep,
    bank_id: uuid.UUID,
    bank_in: BankUpdate,
) -> BankPublic:
    """
    Update a bank. Superuser only.
    """
    bank = session.get(Bank, bank_id)
    if not bank:
        raise HTTPException(status_code=404, detail="Bank not found")
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
    session.delete(bank)
    session.commit()
    return Message(message="Bank deleted successfully")
