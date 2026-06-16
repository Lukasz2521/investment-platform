import uuid
from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import selectinload
from sqlmodel import col, delete, func, select

from app import crud
from app.api.deps import (
    CurrentUser,
    SessionDep,
    get_current_active_superuser,
)
from app.core import security
from app.core.config import settings
from app.core.security import get_password_hash, verify_password
from app.models import (
    Account,
    AccountBank,
    AccountBankPublic,
    AccountBankUpdate,
    AccountPublicForUser,
    BankPublic,
    Item,
    Message,
    Token,
    UpdatePassword,
    User,
    UserCreate,
    UserLogin,
    UserPublic,
    UserPublicWithAccount,
    UserRegister,
    UsersPublic,
    UserUpdate,
    UserUpdateMe,
)
from app.utils import (
    generate_activation_email,
    generate_activation_token,
    send_email,
    verify_activation_token,
)

router = APIRouter(prefix="/users", tags=["users"])


@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UsersPublic,
)
def read_users(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Retrieve users.
    """

    count_statement = select(func.count()).select_from(User)
    count = session.exec(count_statement).one()

    statement = (
        select(User).order_by(col(User.created_at).desc()).offset(skip).limit(limit)
    )
    users = session.exec(statement).all()

    users_public = [UserPublic.model_validate(user) for user in users]
    return UsersPublic(data=users_public, count=count)


@router.post(
    "/", dependencies=[Depends(get_current_active_superuser)], response_model=UserPublic
)
def create_user(*, session: SessionDep, user_in: UserCreate) -> Any:
    """
    Create new user.
    """
    user = crud.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )

    user = crud.create_user(session=session, user_create=user_in)
    return user


@router.patch("/me", response_model=UserPublic)
def update_user_me(
    *, session: SessionDep, user_in: UserUpdateMe, current_user: CurrentUser
) -> Any:
    """
    Update own user.
    """

    if user_in.email:
        existing_user = crud.get_user_by_email(session=session, email=user_in.email)
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(
                status_code=409, detail="User with this email already exists"
            )
    user_data = user_in.model_dump(exclude_unset=True)
    current_user.sqlmodel_update(user_data)
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user


@router.patch("/me/password", response_model=Message)
def update_password_me(
    *, session: SessionDep, body: UpdatePassword, current_user: CurrentUser
) -> Any:
    """
    Update own password.
    """
    verified, _ = verify_password(body.current_password, current_user.hashed_password)
    if not verified:
        raise HTTPException(status_code=400, detail="Incorrect password")
    if body.current_password == body.new_password:
        raise HTTPException(
            status_code=400, detail="New password cannot be the same as the current one"
        )
    hashed_password = get_password_hash(body.new_password)
    current_user.hashed_password = hashed_password
    session.add(current_user)
    session.commit()
    return Message(message="Password updated successfully")


@router.get("/me", response_model=UserPublic)
def read_user_me(current_user: CurrentUser) -> Any:
    """
    Get current user.
    """
    return current_user


@router.delete("/me", response_model=Message)
def delete_user_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Delete own user.
    """
    if current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Super users are not allowed to delete themselves"
        )
    session.delete(current_user)
    session.commit()
    return Message(message="User deleted successfully")


@router.post("/signup", response_model=UserPublic)
def register_user(session: SessionDep, user_in: UserRegister) -> Any:
    """
    Create new user without the need to be logged in.
    Sends an activation email — account is inactive until the link is clicked.
    """
    user = crud.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
    user = crud.create_user(session=session, user_create=user_in)

    if settings.emails_enabled:
        token = generate_activation_token(user_in.email)
        email_data = generate_activation_email(
            email_to=user_in.email,
            username=user_in.username,
            token=token,
        )
        send_email(
            email_to=user_in.email,
            subject=email_data.subject,
            html_content=email_data.html_content,
        )

    return user


@router.get("/activate", response_model=Message)
def activate_user(token: str, session: SessionDep) -> Any:
    """
    Activate user account using the token sent via email.
    """
    email = verify_activation_token(token)
    if not email:
        raise HTTPException(
            status_code=400, detail="Invalid or expired activation token"
        )
    user = crud.get_user_by_email(session=session, email=email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_active:
        return Message(message="Account is already active")
    user.is_active = True
    session.add(user)
    session.commit()
    return Message(message="Account activated successfully")


@router.post("/login", response_model=Token)
def login_user(session: SessionDep, user_in: UserLogin) -> Any:
    """
    Login user. Returns JWT access token.
    Requires active account (email activation link must be clicked first).
    """
    user = crud.authenticate(
        session=session, email=user_in.email, password=user_in.password
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Account is not active. Please check your email and click the activation link.",
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return Token(
        access_token=security.create_access_token(
            user.id, expires_delta=access_token_expires
        )
    )


@router.get(
    "/all",
    dependencies=[Depends(get_current_active_superuser)],
)
def get_users(session: SessionDep) -> UsersPublic:
    """
    Retrieve all users (no pagination). Superuser only.
    """
    count_statement = select(func.count()).select_from(User)
    count = session.exec(count_statement).one()

    statement = select(User).order_by(col(User.created_at).desc())
    users = session.exec(statement).all()

    users_public = [UserPublic.model_validate(user) for user in users]
    return UsersPublic(data=users_public, count=count)


@router.get("/{user_id}")
def read_user_by_id(
    user_id: uuid.UUID, session: SessionDep, current_user: CurrentUser
) -> UserPublicWithAccount:
    """
    Get a specific user by id.
    """
    user = session.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges",
        )

    account = session.exec(
        select(Account)
        .where(Account.user_id == user_id)
        .options(
            selectinload(Account.banks).selectinload(AccountBank.bank),
        )
    ).first()
    return UserPublicWithAccount(
        **UserPublic.model_validate(user).model_dump(),
        account=AccountPublicForUser.from_account(account) if account else None,
    )


@router.patch(
    "/{user_id}/account/banks/{bank_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=AccountBankPublic,
)
def update_user_account_bank(
    *,
    session: SessionDep,
    user_id: uuid.UUID,
    bank_id: uuid.UUID,
    bank_in: AccountBankUpdate,
) -> AccountBankPublic:
    """
    Enable or disable a bank for a user's account.
    """
    account = session.exec(select(Account).where(Account.user_id == user_id)).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    try:
        link = crud.set_account_bank_enabled(
            session=session,
            account=account,
            bank_id=bank_id,
            is_enabled=bank_in.is_enabled,
        )
    except ValueError:
        raise HTTPException(status_code=404, detail="Bank not found")

    link = session.exec(
        select(AccountBank)
        .where(AccountBank.id == link.id)
        .options(selectinload(AccountBank.bank))
    ).one()

    return AccountBankPublic(
        id=link.id,
        is_enabled=link.is_enabled,
        bank=BankPublic.model_validate(link.bank),
    )


@router.patch(
    "/{user_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UserPublic,
)
def update_user(
    *,
    session: SessionDep,
    user_id: uuid.UUID,
    user_in: UserUpdate,
) -> Any:
    """
    Update a user.
    """

    db_user = session.get(User, user_id)
    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    if user_in.email:
        existing_user = crud.get_user_by_email(session=session, email=user_in.email)
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=409, detail="User with this email already exists"
            )

    db_user = crud.update_user(session=session, db_user=db_user, user_in=user_in)
    return db_user


@router.delete("/{user_id}", dependencies=[Depends(get_current_active_superuser)])
def delete_user(
    session: SessionDep, current_user: CurrentUser, user_id: uuid.UUID
) -> Message:
    """
    Delete a user.
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user == current_user:
        raise HTTPException(
            status_code=403, detail="Super users are not allowed to delete themselves"
        )
    statement = delete(Item).where(col(Item.owner_id) == user_id)
    session.exec(statement)
    session.delete(user)
    session.commit()
    return Message(message="User deleted successfully")
