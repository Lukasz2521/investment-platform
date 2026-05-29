from datetime import timedelta
from typing import Any

from fastapi import APIRouter, HTTPException

from app import crud
from app.api.deps import SessionDep
from app.core import security
from app.core.config import settings
from app.models import Token, UserLogin

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/login", response_model=Token)
def admin_login(session: SessionDep, user_in: UserLogin) -> Any:
    """
    Login for the admin panel. Returns a JWT only for superuser accounts.
    """
    user = crud.authenticate(
        session=session, email=user_in.email, password=user_in.password
    )
    if not user or not user.is_superuser:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return Token(
        access_token=security.create_access_token(
            user.id, expires_delta=access_token_expires
        )
    )
