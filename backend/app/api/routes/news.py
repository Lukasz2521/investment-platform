import uuid

from fastapi import APIRouter, Depends, HTTPException

from app import crud
from app.api.deps import SessionDep, get_current_active_superuser
from app.models import (
    Message,
    News,
    NewsCreate,
    NewsListPublic,
    NewsPublic,
    NewsUpdate,
)

router = APIRouter(prefix="/news", tags=["news"])


def _require_text(value: str, field: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise HTTPException(status_code=400, detail=f"{field} is required.")
    return cleaned


@router.get("/", response_model=NewsListPublic)
def read_news(
    *, session: SessionDep, skip: int = 0, limit: int = 100
) -> NewsListPublic:
    """
    List published news. Public endpoint for the marketing site.
    """
    items, count = crud.get_news_items(session=session, skip=skip, limit=limit)
    return NewsListPublic(
        data=[NewsPublic.model_validate(item) for item in items],
        count=count,
    )


@router.post(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
)
def create_news(*, session: SessionDep, news_in: NewsCreate) -> NewsPublic:
    """
    Create a news item. Superuser only.
    """
    news = crud.create_news(
        session=session,
        news_in=NewsCreate(
            title=_require_text(news_in.title, "Title"),
            description=_require_text(news_in.description, "Description"),
            published_at=news_in.published_at,
        ),
    )
    return NewsPublic.model_validate(news)


@router.put(
    "/{news_id}",
    dependencies=[Depends(get_current_active_superuser)],
)
def update_news(
    *,
    session: SessionDep,
    news_id: uuid.UUID,
    news_in: NewsUpdate,
) -> NewsPublic:
    """
    Update a news item. Superuser only.
    """
    db_news = session.get(News, news_id)
    if not db_news:
        raise HTTPException(status_code=404, detail="News item not found")

    payload = news_in.model_dump(exclude_unset=True)
    if "title" in payload and payload["title"] is not None:
        payload["title"] = _require_text(payload["title"], "Title")
    if "description" in payload and payload["description"] is not None:
        payload["description"] = _require_text(payload["description"], "Description")

    db_news = crud.update_news(
        session=session,
        db_news=db_news,
        news_in=NewsUpdate.model_validate(payload),
    )
    return NewsPublic.model_validate(db_news)


@router.delete(
    "/{news_id}",
    dependencies=[Depends(get_current_active_superuser)],
)
def delete_news(*, session: SessionDep, news_id: uuid.UUID) -> Message:
    """
    Delete a news item. Superuser only.
    """
    db_news = session.get(News, news_id)
    if not db_news:
        raise HTTPException(status_code=404, detail="News item not found")
    session.delete(db_news)
    session.commit()
    return Message(message="News item deleted successfully")
