import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app import crud
from app.api.deps import SessionDep, get_current_active_superuser
from app.models import (
    Campaign,
    Category,
    CategoryCreate,
    CategoryPublic,
    CategoryUpdate,
    Message,
)

router = APIRouter(prefix="/campaigns/categories", tags=["categories"])


@router.post(
    "/",
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
    "/{category_id}",
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


@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
)
def read_categories(*, session: SessionDep) -> list[CategoryPublic]:
    """
    List all campaign categories. Superuser only.
    """
    categories = crud.get_categories(session=session)
    return [CategoryPublic.model_validate(c) for c in categories]


@router.delete(
    "/{category_id}",
    dependencies=[Depends(get_current_active_superuser)],
)
def delete_category(
    *,
    session: SessionDep,
    category_id: uuid.UUID,
) -> Message:
    """
    Delete a campaign category. Superuser only.
    """
    db_category = session.get(Category, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    count_statement = (
        select(func.count())
        .select_from(Campaign)
        .where(Campaign.category_id == category_id)
    )
    count = session.exec(count_statement).one()
    if count > 0:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete category while campaigns reference it.",
        )
    session.delete(db_category)
    session.commit()
    return Message(message="Category deleted successfully")
