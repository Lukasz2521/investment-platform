import uuid

from fastapi import APIRouter, Depends, HTTPException

from app import crud
from app.api.deps import SessionDep, get_current_active_superuser
from app.models import (
    Campaign,
    CampaignCreate,
    CampaignPublic,
    CampaignsPublic,
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

    return CampaignPublic.model_validate(campaign)


@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
)
def read_campaigns(
    *,
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
) -> CampaignsPublic:
    """
    List campaigns. Superuser only.
    """
    campaigns, total = crud.get_campaigns(session=session, skip=skip, limit=limit)
    return CampaignsPublic(
        data=[CampaignPublic.model_validate(c) for c in campaigns],
        count=total,
    )


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
