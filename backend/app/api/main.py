from fastapi import APIRouter

from app.api.routes import (
    admin,
    banks,
    campaigns,
    categories,
    items,
    login,
    private,
    transactions,
    users,
    utils,
)
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(admin.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(items.router)
api_router.include_router(transactions.router)
api_router.include_router(banks.router)
api_router.include_router(campaigns.router)
api_router.include_router(categories.router)


if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
