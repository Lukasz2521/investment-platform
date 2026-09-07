import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app import crud
from app.api.deps import CurrentUser, SessionDep
from app.models import Account, UserCampaignCreate, UserCampaignPublic, UserCampaignsPublic

router = APIRouter(prefix="/user-campaigns", tags=["user-campaigns"])

INSUFFICIENT_FUNDS_DETAIL = "Insufficient funds"


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
    if campaign_in.start_date < today:
        raise HTTPException(
            status_code=400, detail="Start date cannot be in the past"
        )
    if campaign_in.end_date < campaign_in.start_date:
        raise HTTPException(
            status_code=400, detail="End date cannot be before start date"
        )
    duration_days = (campaign_in.end_date - campaign_in.start_date).days
    if duration_days < campaign.min_days:
        raise HTTPException(
            status_code=400,
            detail=f"Campaign duration must be at least {campaign.min_days} days",
        )
    if campaign_in.budget < campaign.budget:
        raise HTTPException(
            status_code=400, detail="Budget is below the campaign minimum"
        )

    account = session.exec(
        select(Account).where(Account.user_id == current_user.id)
    ).first()
    if account is None or account.available_balance < campaign_in.budget:
        raise HTTPException(status_code=400, detail=INSUFFICIENT_FUNDS_DETAIL)

    account.available_balance -= campaign_in.budget
    session.add(account)

    row = crud.create_user_campaign(
        session=session, user_id=current_user.id, campaign_in=campaign_in
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
    rows, total = crud.get_user_campaigns_by_user_id(
        session=session, user_id=current_user.id, skip=skip, limit=limit
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
    row = crud.get_user_campaign(session=session, user_campaign_id=user_campaign_id)
    if not row or row.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return crud.to_user_campaign_public(row)
