
from fastapi import APIRouter, Depends, HTTPException

from app import crud
from app.api.deps import SessionDep, get_current_active_superuser
from app.models import CategoryCreate, CategoryPublic

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


@router.post(
    "/categories",
    dependencies=[Depends(get_current_active_superuser)],
)
def create_category(
    *, session: SessionDep, category_in: CategoryCreate
) -> CategoryPublic:
    """
    Create a campaign category. Superuser only.
    """
    existing = crud.get_category_by_name(session=session, name=category_in.name)
    if existing:
        raise HTTPException(
            status_code=400,
            detail="A category with this name already exists.",
        )
    category = crud.create_category(session=session, category_in=category_in)
    return CategoryPublic.model_validate(category)
