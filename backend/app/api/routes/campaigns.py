import uuid

from fastapi import APIRouter, Depends, HTTPException

from app import crud
from app.api.deps import SessionDep, get_current_active_superuser
from app.models import Category, CategoryCreate, CategoryPublic, CategoryUpdate

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


@router.put(
    "/categories/{category_id}",
    dependencies=[Depends(get_current_active_superuser)],
)
def update_category(
    *,
    session: SessionDep,
    category_id: uuid.UUID,
    category_in: CategoryUpdate,
) -> CategoryPublic:
    """
    Update a campaign category. Superuser only.
    """
    db_category = session.get(Category, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    if category_in.name != db_category.name:
        conflict = crud.get_category_by_name(session=session, name=category_in.name)
        if conflict:
            raise HTTPException(
                status_code=400,
                detail="A category with this name already exists.",
            )
    db_category = crud.update_category(
        session=session, db_category=db_category, category_in=category_in
    )
    return CategoryPublic.model_validate(db_category)

    
