import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from app import crud
from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.models import (
    CreateTransaction,
    CreateWithdrawRequest,
    Message,
    Transaction,
    TransactionPublic,
    TransactionStatus,
    TransactionType,
    TransactionsPublic,
    UpdateTransaction,
    User,
)

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.post(
    "/",
    response_model=TransactionPublic,
    dependencies=[Depends(get_current_active_superuser)],
)
def create_transaction(
    *,
    session: SessionDep,
    transaction_in: CreateTransaction,
) -> Any:
    """
    Create a new transaction. Non-superusers may only create for their own user id.
    """
    target_id = transaction_in.user_id
    user = session.get(User, target_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    tx = crud.create_transaction(session=session, transaction_in=transaction_in)
    return TransactionPublic.model_validate(tx)


@router.get(
    "/",
    response_model=TransactionsPublic,
    dependencies=[Depends(get_current_active_superuser)],
)
def get_transactions(
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Get all transactions.
    """
    transactions, count = crud.get_transactions(session=session, skip=skip, limit=limit)
    data = [TransactionPublic.model_validate(tx) for tx in transactions]
    return TransactionsPublic(data=data, count=count)


@router.get("/me", response_model=TransactionsPublic)
def get_my_transactions(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Get transactions for the currently authenticated user.
    """
    transactions, count = crud.get_transactions_by_user_id(
        session=session, user_id=current_user.id, skip=skip, limit=limit
    )
    data = [TransactionPublic.model_validate(tx) for tx in transactions]
    return TransactionsPublic(data=data, count=count)


@router.post("/me/withdraw", response_model=TransactionPublic)
def create_my_withdraw(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    withdraw_in: CreateWithdrawRequest,
) -> Any:
    """
    Create a pending withdrawal for the currently authenticated user.
    """
    description = (
        f"Withdraw ({withdraw_in.transfer_type.value.upper()}) | "
        f"Holder: {withdraw_in.account_holder_name} | "
        f"Purpose: {withdraw_in.payment_purpose} | "
        f"IBAN: {withdraw_in.sepa_address} | "
        f"Bank: {withdraw_in.bank_address}"
    )[:1024]

    transaction_in = CreateTransaction(
        amount=withdraw_in.amount,
        transaction_type=TransactionType.WITHDRAW,
        status=TransactionStatus.PENDING,
        user_id=current_user.id,
        description=description,
    )
    tx = crud.create_transaction(session=session, transaction_in=transaction_in)
    return TransactionPublic.model_validate(tx)


@router.get(
    "/user/{user_id}",
    dependencies=[Depends(get_current_active_superuser)],
)
def get_user_transactions(
    session: SessionDep,
    user_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
) -> TransactionsPublic:
    """
    Get transactions for a specific user.
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    transactions, count = crud.get_transactions_by_user_id(
        session=session, user_id=user_id, skip=skip, limit=limit
    )
    data = [TransactionPublic.model_validate(tx) for tx in transactions]
    return TransactionsPublic(data=data, count=count)


@router.put(
    "/{transaction_id}",
    response_model=TransactionPublic,
    dependencies=[Depends(get_current_active_superuser)],
)
def update_transaction(
    *,
    session: SessionDep,
    transaction_id: uuid.UUID,
    transaction_in: UpdateTransaction,
) -> Any:
    """
    Update a transaction.
    """
    transaction = session.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    transaction = crud.update_transaction(
        session=session, db_transaction=transaction, transaction_in=transaction_in
    )
    return TransactionPublic.model_validate(transaction)


@router.delete(
    "/{transaction_id}",
    dependencies=[Depends(get_current_active_superuser)],
)
def remove_transaction(
    *,
    session: SessionDep,
    transaction_id: uuid.UUID,
) -> Message:
    """
    Remove a transaction.
    """
    transaction = session.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    session.delete(transaction)
    session.commit()
    return Message(message="Transaction deleted successfully")
