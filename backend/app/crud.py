import uuid
from datetime import date, datetime, timezone
from typing import Any

from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, func, select

from app.campaigns.tick import (
    clamp_campaign_stats,
    initial_campaign_stats,
    record_daily_metric_tick,
)
from app.core.security import get_password_hash, verify_password
from app.models import (
    Account,
    AccountBank,
    Bank,
    BankCreate,
    BankUpdate,
    Campaign,
    CampaignCreate,
    CampaignMetricTick,
    CampaignMetricTickPublic,
    CampaignMetricTicksPublic,
    CampaignPublic,
    CampaignStatsPublic,
    CampaignUpdate,
    Category,
    CategoryCreate,
    CategoryUpdate,
    CreateTransaction,
    Item,
    ItemCreate,
    Transaction,
    UpdateTransaction,
    User,
    UserCampaign,
    UserCampaignCreate,
    UserCampaignPublic,
    UserCampaignStatus,
    UserCampaignsPublic,
    UserCreate,
    UserRegister,
    UserUpdate,
    validate_campaign_metric_ranges,
)


def create_default_account(*, session: Session, user_id: uuid.UUID) -> Account:
    account = Account(user_id=user_id)
    session.add(account)
    return account


def create_user(*, session: Session, user_create: UserCreate | UserRegister) -> User:
    update_kw: dict[str, Any] = {
        "hashed_password": get_password_hash(user_create.password),
    }
    if isinstance(user_create, UserRegister):
        update_kw["is_active"] = False
    db_obj = User.model_validate(user_create, update=update_kw)
    session.add(db_obj)
    session.flush()
    create_default_account(session=session, user_id=db_obj.id)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}
    if "password" in user_data:
        password = user_data["password"]
        hashed_password = get_password_hash(password)
        extra_data["hashed_password"] = hashed_password
    db_user.sqlmodel_update(user_data, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user


# Dummy hash to use for timing attack prevention when user is not found
# This is an Argon2 hash of a random password, used to ensure constant-time comparison
DUMMY_HASH = "$argon2id$v=19$m=65536,t=3,p=4$MjQyZWE1MzBjYjJlZTI0Yw$YTU4NGM5ZTZmYjE2NzZlZjY0ZWY3ZGRkY2U2OWFjNjk"


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    db_user = get_user_by_email(session=session, email=email)
    if not db_user:
        # Prevent timing attacks by running password verification even when user doesn't exist
        # This ensures the response time is similar whether or not the email exists
        verify_password(password, DUMMY_HASH)
        return None
    verified, updated_password_hash = verify_password(password, db_user.hashed_password)
    if not verified:
        return None
    if updated_password_hash:
        db_user.hashed_password = updated_password_hash
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
    return db_user


def create_item(*, session: Session, item_in: ItemCreate, owner_id: uuid.UUID) -> Item:
    db_item = Item.model_validate(item_in, update={"owner_id": owner_id})
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item


def get_category_by_name(*, session: Session, name: str) -> Category | None:
    statement = select(Category).where(Category.name == name)
    return session.exec(statement).first()


def create_category(*, session: Session, category_in: CategoryCreate) -> Category:
    db_obj = Category.model_validate(category_in)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def create_campaign(*, session: Session, campaign_in: CampaignCreate) -> Campaign:
    db_obj = Campaign.model_validate(campaign_in)
    session.add(db_obj)
    session.flush()
    stats = initial_campaign_stats(db_obj)
    session.add(stats)
    session.flush()
    record_daily_metric_tick(
        session,
        campaign_id=db_obj.id,
        cpm=stats.cpm,
        epc=stats.epc,
        ctr=stats.ctr,
    )
    session.commit()
    session.refresh(db_obj)
    return db_obj


def get_campaigns(
    *, session: Session, skip: int = 0, limit: int = 100
) -> tuple[list[Campaign], int]:
    count_statement = select(func.count()).select_from(Campaign)
    count = session.exec(count_statement).one()
    statement = (
        select(Campaign)
        .options(selectinload(Campaign.stats))
        .order_by(col(Campaign.created_at).desc())
        .offset(skip)
        .limit(limit)
    )
    rows = session.exec(statement).all()
    return list(rows), count


def get_campaign(*, session: Session, campaign_id: uuid.UUID) -> Campaign | None:
    statement = (
        select(Campaign)
        .options(selectinload(Campaign.stats))
        .where(Campaign.id == campaign_id)
    )
    return session.exec(statement).first()


def to_campaign_public(campaign: Campaign) -> CampaignPublic:
    public = CampaignPublic.model_validate(campaign, update={"stats": None})
    if campaign.stats is not None:
        public.stats = CampaignStatsPublic(
            cpm=campaign.stats.cpm,
            epc=campaign.stats.epc,
            ctr=campaign.stats.ctr,
            calculated_at=campaign.stats.calculated_at,
        )
    return public


def get_campaign_metric_ticks(
    *, session: Session, campaign_id: uuid.UUID, limit: int = 90
) -> CampaignMetricTicksPublic:
    statement = (
        select(CampaignMetricTick)
        .where(CampaignMetricTick.campaign_id == campaign_id)
        .order_by(col(CampaignMetricTick.recorded_on).asc())
        .limit(limit)
    )
    rows = list(session.exec(statement).all())
    return CampaignMetricTicksPublic(
        data=[
            CampaignMetricTickPublic(
                recorded_on=row.recorded_on,
                recorded_at=row.recorded_at,
                cpm=row.cpm,
                epc=row.epc,
                ctr=row.ctr,
            )
            for row in rows
        ],
        count=len(rows),
    )


def update_campaign(
    *,
    session: Session,
    db_campaign: Campaign,
    campaign: CampaignUpdate,
) -> Campaign:
    update_dict = campaign.model_dump(exclude_unset=True, by_alias=False)
    if not update_dict:
        return db_campaign
    db_campaign.sqlmodel_update(update_dict)
    validate_campaign_metric_ranges(
        cpm_min=db_campaign.cpm_min,
        cpm_base=db_campaign.cpm_base,
        cpm_max=db_campaign.cpm_max,
        epc_min=db_campaign.epc_min,
        epc_max=db_campaign.epc_max,
        ctr_min=db_campaign.ctr_min,
        ctr_max=db_campaign.ctr_max,
    )
    session.add(db_campaign)
    if db_campaign.stats is not None:
        clamp_campaign_stats(db_campaign, db_campaign.stats)
        session.add(db_campaign.stats)
    session.commit()
    session.refresh(db_campaign)
    return db_campaign


def get_categories(*, session: Session) -> list[Category]:
    statement = select(Category).order_by(col(Category.name))
    return list(session.exec(statement).all())


def update_category(
    *, session: Session, db_category: Category, category_in: CategoryUpdate
) -> Category:
    db_category.sqlmodel_update(category_in.model_dump())
    session.add(db_category)
    session.commit()
    session.refresh(db_category)
    return db_category


def create_transaction(
    *, session: Session, transaction_in: CreateTransaction
) -> Transaction:
    db_obj = Transaction.model_validate(transaction_in)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def get_transactions(
    *, session: Session, skip: int = 0, limit: int = 100
) -> tuple[list[Transaction], int]:
    count_statement = select(func.count()).select_from(Transaction)
    count = session.exec(count_statement).one()
    statement = (
        select(Transaction)
        .order_by(col(Transaction.created_at).desc())
        .offset(skip)
        .limit(limit)
    )
    rows = session.exec(statement).all()
    return list(rows), count


def get_transactions_by_user_id(
    *,
    session: Session,
    user_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
) -> tuple[list[Transaction], int]:
    count_statement = (
        select(func.count())
        .select_from(Transaction)
        .where(Transaction.user_id == user_id)
    )
    count = session.exec(count_statement).one()
    statement = (
        select(Transaction)
        .where(Transaction.user_id == user_id)
        .order_by(col(Transaction.created_at).desc())
        .offset(skip)
        .limit(limit)
    )
    rows = session.exec(statement).all()
    return list(rows), count


def update_transaction(
    *,
    session: Session,
    db_transaction: Transaction,
    transaction_in: UpdateTransaction,
) -> Transaction:
    update_dict = transaction_in.model_dump(exclude_unset=True, mode="json")
    db_transaction.sqlmodel_update(update_dict)
    session.add(db_transaction)
    session.commit()
    session.refresh(db_transaction)
    return db_transaction


def create_bank(*, session: Session, bank_in: BankCreate) -> Bank:
    db_obj = Bank.model_validate(bank_in)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def get_banks(
    *, session: Session, skip: int = 0, limit: int = 100
) -> tuple[list[Bank], int]:
    count_statement = select(func.count()).select_from(Bank)
    count = session.exec(count_statement).one()
    statement = select(Bank).order_by(col(Bank.name)).offset(skip).limit(limit)
    rows = session.exec(statement).all()
    return list(rows), count


def update_bank(*, session: Session, db_bank: Bank, bank_in: BankUpdate) -> Bank:
    update_dict = bank_in.model_dump(exclude_unset=True)
    if not update_dict:
        return db_bank
    db_bank.sqlmodel_update(update_dict)
    session.add(db_bank)
    session.commit()
    session.refresh(db_bank)
    return db_bank


def set_account_bank_enabled(
    *,
    session: Session,
    account: Account,
    bank_id: uuid.UUID,
    is_enabled: bool,
) -> AccountBank:
    bank = session.get(Bank, bank_id)
    if not bank:
        raise ValueError("Bank not found")

    statement = select(AccountBank).where(
        AccountBank.account_id == account.id,
        AccountBank.bank_id == bank_id,
    )
    link = session.exec(statement).first()
    if link:
        link.is_enabled = is_enabled
    else:
        link = AccountBank(
            account_id=account.id,
            bank_id=bank_id,
            is_enabled=is_enabled,
        )
        session.add(link)

    session.commit()
    session.refresh(link)
    return link


def resolve_user_campaign_status(
    row: UserCampaign, *, today: date | None = None
) -> UserCampaignStatus:
    if row.status == UserCampaignStatus.CANCELLED:
        return UserCampaignStatus.CANCELLED
    today = today or datetime.now(timezone.utc).date()
    if row.end_date < today:
        return UserCampaignStatus.COMPLETED
    return UserCampaignStatus.ACTIVE


def to_user_campaign_public(row: UserCampaign) -> UserCampaignPublic:
    if row.campaign is None:
        raise ValueError("Campaign is required")
    return UserCampaignPublic(
        id=row.id,
        user_id=row.user_id,
        campaign_id=row.campaign_id,
        start_date=row.start_date,
        end_date=row.end_date,
        budget=row.budget,
        status=resolve_user_campaign_status(row),
        created_at=row.created_at,
        campaign=to_campaign_public(row.campaign),
    )


def _user_campaign_query():
    return select(UserCampaign).options(
        selectinload(UserCampaign.campaign).selectinload(Campaign.stats)
    )


def create_user_campaign(
    *,
    session: Session,
    user_id: uuid.UUID,
    campaign_in: UserCampaignCreate,
) -> UserCampaign:
    db_obj = UserCampaign(
        user_id=user_id,
        campaign_id=campaign_in.campaign_id,
        start_date=campaign_in.start_date,
        end_date=campaign_in.end_date,
        budget=campaign_in.budget,
        status=UserCampaignStatus.ACTIVE,
    )
    session.add(db_obj)
    session.commit()
    loaded = get_user_campaign(session=session, user_campaign_id=db_obj.id)
    assert loaded is not None
    return loaded


def get_user_campaign(
    *, session: Session, user_campaign_id: uuid.UUID
) -> UserCampaign | None:
    statement = _user_campaign_query().where(UserCampaign.id == user_campaign_id)
    return session.exec(statement).first()


def get_user_campaigns_by_user_id(
    *, session: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 100
) -> tuple[list[UserCampaign], int]:
    count_statement = (
        select(func.count())
        .select_from(UserCampaign)
        .where(UserCampaign.user_id == user_id)
    )
    count = session.exec(count_statement).one()
    statement = (
        _user_campaign_query()
        .where(UserCampaign.user_id == user_id)
        .order_by(col(UserCampaign.created_at).desc())
        .offset(skip)
        .limit(limit)
    )
    rows = session.exec(statement).all()
    return list(rows), count
