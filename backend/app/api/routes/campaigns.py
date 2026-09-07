import uuid

from fastapi import APIRouter, Depends, HTTPException

from app import crud
from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.models import (
    Campaign,
    CampaignCreate,
    CampaignMetricTicksPublic,
    CampaignPublic,
    CampaignsPublic,
    CampaignUpdate,
    Category,
    Message,
)

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


@router.post(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
)
def create_campaign(
    *, session: SessionDep, campaign_in: CampaignCreate
) -> CampaignPublic:
    """
    Create a new campaign. Superuser only.
    """
    if not session.get(Category, campaign_in.category_id):
        raise HTTPException(status_code=404, detail="Category not found")
    campaign = crud.create_campaign(session=session, campaign_in=campaign_in)

    return crud.to_campaign_public(campaign)


@router.get("/{campaign_id}/metric-ticks")
def read_campaign_metric_ticks(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    campaign_id: uuid.UUID,
    limit: int = 90,
) -> CampaignMetricTicksPublic:
    """
    Daily metric snapshots for campaign charts. Available to any authenticated user.
    """
    _ = current_user
    if not session.get(Campaign, campaign_id):
        raise HTTPException(status_code=404, detail="Campaign not found")
    return crud.get_campaign_metric_ticks(
        session=session, campaign_id=campaign_id, limit=limit
    )


@router.get("/")
def read_campaigns(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> CampaignsPublic:
    """
    List campaigns. Available to any authenticated user.
    """
    _ = current_user
    campaigns, total = crud.get_campaigns(session=session, skip=skip, limit=limit)
    return CampaignsPublic(
        data=[crud.to_campaign_public(c) for c in campaigns],
        count=total,
    )


@router.get("/{campaign_id}")
def read_campaign(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    campaign_id: uuid.UUID,
) -> CampaignPublic:
    """
    Get a campaign by id. Available to any authenticated user.
    """
    _ = current_user
    campaign = crud.get_campaign(session=session, campaign_id=campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return crud.to_campaign_public(campaign)


@router.put(
    "/{campaign_id}",
    dependencies=[Depends(get_current_active_superuser)],
)
def update_campaign(
    *,
    session: SessionDep,
    campaign_id: uuid.UUID,
    campaign: CampaignUpdate,
) -> CampaignPublic:
    """
    Update a campaign. Superuser only.
    """
    db_campaign = session.get(Campaign, campaign_id)
    if not db_campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    incoming = campaign.model_dump(exclude_unset=True, by_alias=False)
    if "category_id" in incoming and not session.get(Category, incoming["category_id"]):
        raise HTTPException(status_code=404, detail="Category not found")
    try:
        updated = crud.update_campaign(
            session=session, db_campaign=db_campaign, campaign=campaign
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return crud.to_campaign_public(updated)


@router.delete(
    "/{campaign_id}",
    dependencies=[Depends(get_current_active_superuser)],
)
def delete_campaign(
    *,
    session: SessionDep,
    campaign_id: uuid.UUID,
) -> Message:
    """
    Delete a campaign. Superuser only.
    """
    campaign = session.get(Campaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    session.delete(campaign)
    session.commit()
    return Message(message="Campaign deleted successfully")
