import uuid
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select

from app import crud
from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.models import (
    Account,
    Transaction,
    TransactionStatus,
    TransactionType,
    User,
    UserCampaignCreate,
    UserCampaignPublic,
    UserCampaignRiskUpdate,
    UserCampaignsPublic,
)

router = APIRouter(prefix="/user-campaigns", tags=["user-campaigns"])

INSUFFICIENT_FUNDS_DETAIL = "Insufficient funds"
CREATOR_MIN_BUDGET = Decimal("200")
CREATOR_MIN_DAYS = 3


@router.post("/", response_model=UserCampaignPublic)
def start_user_campaign(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    campaign_in: UserCampaignCreate,
) -> UserCampaignPublic:
    """
    Start a market campaign for the current user.
    """
    campaign = crud.get_campaign(session=session, campaign_id=campaign_in.campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    today = datetime.now(timezone.utc).date()
    if campaign_in.start_date != today:
        raise HTTPException(status_code=400, detail="Start date must be today")
    if campaign_in.end_date < campaign_in.start_date:
        raise HTTPException(
            status_code=400, detail="End date cannot be before start date"
        )
    duration_days = (campaign_in.end_date - campaign_in.start_date).days
    if campaign_in.creator:
        if duration_days < CREATOR_MIN_DAYS:
            raise HTTPException(
                status_code=400,
                detail="Campaign duration must be at least 3 days",
            )
    elif duration_days < campaign.min_days:
        raise HTTPException(
            status_code=400,
            detail=f"Campaign duration must be at least {campaign.min_days} days",
        )
    if campaign_in.creator:
        if campaign_in.budget < CREATOR_MIN_BUDGET:
            raise HTTPException(
                status_code=400, detail="Budget must be at least 200 EUR"
            )
    elif campaign_in.budget < campaign.budget:
        raise HTTPException(
            status_code=400, detail="Budget is below the campaign minimum"
        )

    try:
        crud.ensure_user_can_start_campaign(session=session, user=current_user)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    account = session.exec(
        select(Account).where(Account.user_id == current_user.id)
    ).first()
    if account is None or account.available_balance < campaign_in.budget:
        raise HTTPException(status_code=400, detail=INSUFFICIENT_FUNDS_DETAIL)

    account.available_balance -= campaign_in.budget
    session.add(account)
    session.add(
        Transaction(
            user_id=current_user.id,
            amount=campaign_in.budget,
            transaction_type=TransactionType.CAMPAIGN_WITHDRAW.value,
            status=TransactionStatus.DONE.value,
            description=campaign.title,
        )
    )

    cpm, epc, ctr = crud.snapshot_campaign_metrics(campaign)
    row = crud.create_user_campaign(
        session=session,
        user_id=current_user.id,
        campaign_in=campaign_in,
        cpm=cpm,
        epc=epc,
        ctr=ctr,
        participation=account.participation,
    )
    return crud.to_user_campaign_public(row)


@router.get("/", response_model=UserCampaignsPublic)
def read_my_user_campaigns(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> UserCampaignsPublic:
    """
    List campaigns started by the current user.
    """
    crud.settle_completed_user_campaigns(session=session, user_id=current_user.id)
    rows, total = crud.get_user_campaigns_by_user_id(
        session=session, user_id=current_user.id, skip=skip, limit=limit
    )
    return UserCampaignsPublic(
        data=[crud.to_user_campaign_public(row) for row in rows],
        count=total,
    )


@router.get(
    "/user/{user_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UserCampaignsPublic,
)
def read_user_campaigns(
    session: SessionDep,
    user_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
) -> UserCampaignsPublic:
    """
    List campaigns started by a specific user.
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    crud.settle_completed_user_campaigns(session=session, user_id=user_id)
    rows, total = crud.get_user_campaigns_by_user_id(
        session=session, user_id=user_id, skip=skip, limit=limit
    )
    return UserCampaignsPublic(
        data=[crud.to_user_campaign_public(row) for row in rows],
        count=total,
    )


@router.get("/{user_campaign_id}", response_model=UserCampaignPublic)
def read_my_user_campaign(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    user_campaign_id: uuid.UUID,
) -> UserCampaignPublic:
    """
    Get a campaign started by the current user.
    """
    crud.settle_completed_user_campaigns(session=session, user_id=current_user.id)
    row = crud.get_user_campaign(session=session, user_campaign_id=user_campaign_id)
    if not row or row.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return crud.to_user_campaign_public(row)


@router.patch(
    "/{user_campaign_id}/risk-mode",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UserCampaignPublic,
)
def update_user_campaign_risk_mode(
    *,
    session: SessionDep,
    user_campaign_id: uuid.UUID,
    body: UserCampaignRiskUpdate,
) -> UserCampaignPublic:
    """
    Steer the final result of a client's active campaign.
    """
    row = crud.get_user_campaign(session=session, user_campaign_id=user_campaign_id)
    if not row:
        raise HTTPException(status_code=404, detail="Campaign not found")
    try:
        updated = crud.set_user_campaign_risk(
            session=session,
            row=row,
            risk_mode=body.risk_mode,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return crud.to_user_campaign_public(updated)
