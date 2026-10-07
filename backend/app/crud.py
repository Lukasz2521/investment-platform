import uuid
from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Any

from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, func, select

from app.campaigns.economics import estimate_campaign_economics
from app.campaigns.engine import midpoint
from app.campaigns.risk import (
    RiskBaseline,
    delivery_fraction,
    natural_baseline,
    project_risk,
)
from app.campaigns.tick import (
    USER_CAMPAIGN_DURATION,
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
    News,
    NewsCreate,
    NewsUpdate,
    Transaction,
    TransactionStatus,
    TransactionType,
    UpdateTransaction,
    User,
    UserCampaign,
    UserCampaignCreate,
    UserCampaignPublic,
    UserCampaignStatus,
    UserCampaignsPublic,
    UserCreate,
    UserDocument,
    UserDocumentPublic,
    UserDocumentType,
    get_datetime_utc,
    UserPublic,
    UserRegister,
    UserUpdate,
    REQUIRED_USER_DOCUMENT_TYPES,
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
    visible = col(Campaign.deleted_at).is_(None)
    count_statement = select(func.count()).select_from(Campaign).where(visible)
    count = session.exec(count_statement).one()
    statement = (
        select(Campaign)
        .options(selectinload(Campaign.stats))
        .where(visible)
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
        .where(Campaign.id == campaign_id, col(Campaign.deleted_at).is_(None))
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


def create_news(*, session: Session, news_in: NewsCreate) -> News:
    payload = news_in.model_dump()
    if payload.get("published_at") is None:
        payload["published_at"] = datetime.now(timezone.utc).date()
    db_obj = News.model_validate(payload)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def get_news_items(
    *, session: Session, skip: int = 0, limit: int = 100
) -> tuple[list[News], int]:
    count_statement = select(func.count()).select_from(News)
    count = session.exec(count_statement).one()
    statement = (
        select(News)
        .order_by(col(News.published_at).desc(), col(News.created_at).desc())
        .offset(skip)
        .limit(limit)
    )
    rows = session.exec(statement).all()
    return list(rows), count


def update_news(*, session: Session, db_news: News, news_in: NewsUpdate) -> News:
    update_dict = news_in.model_dump(exclude_unset=True)
    if not update_dict:
        return db_news
    db_news.sqlmodel_update(update_dict)
    session.add(db_news)
    session.commit()
    session.refresh(db_news)
    return db_news


def _status_value(status: TransactionStatus | str | None) -> str | None:
    if status is None:
        return None
    if isinstance(status, TransactionStatus):
        return status.value
    return str(status)


def _transaction_type_value(transaction_type: TransactionType | str) -> str:
    if isinstance(transaction_type, TransactionType):
        return transaction_type.value
    return str(transaction_type)


def _get_account_by_user_id(*, session: Session, user_id: uuid.UUID) -> Account | None:
    return session.exec(select(Account).where(Account.user_id == user_id)).first()


def _apply_deposit_status_change(
    *,
    session: Session,
    user_id: uuid.UUID,
    amount: Decimal,
    transaction_type: TransactionType | str,
    previous_status: TransactionStatus | str | None,
    new_status: TransactionStatus | str | None,
) -> None:
    if _transaction_type_value(transaction_type) != TransactionType.DEPOSIT.value:
        return

    was_done = _status_value(previous_status) == TransactionStatus.DONE.value
    is_done = _status_value(new_status) == TransactionStatus.DONE.value
    if was_done == is_done:
        return

    account = _get_account_by_user_id(session=session, user_id=user_id)
    if account is None:
        raise ValueError("User has no account")

    delta = amount if is_done else -amount
    account.available_balance += delta
    account.total_deposit = max(Decimal("0"), account.total_deposit + delta)
    session.add(account)


_HELD_WITHDRAW_STATUSES = {
    TransactionStatus.PENDING.value,
    TransactionStatus.DONE.value,
}
INSUFFICIENT_AVAILABLE_BALANCE = "Insufficient available balance"


def _apply_withdraw_status_change(
    *,
    session: Session,
    user_id: uuid.UUID,
    amount: Decimal,
    transaction_type: TransactionType | str,
    previous_status: TransactionStatus | str | None,
    new_status: TransactionStatus | str | None,
) -> None:
    if _transaction_type_value(transaction_type) != TransactionType.WITHDRAW.value:
        return

    previous = _status_value(previous_status)
    new = _status_value(new_status)
    was_held = previous in _HELD_WITHDRAW_STATUSES
    is_held = new in _HELD_WITHDRAW_STATUSES
    was_done = previous == TransactionStatus.DONE.value
    is_done = new == TransactionStatus.DONE.value
    if was_held == is_held and was_done == is_done:
        return

    account = _get_account_by_user_id(session=session, user_id=user_id)
    if account is None:
        raise ValueError("User has no account")

    if is_held and not was_held and amount > 0 and account.available_balance < amount:
        raise ValueError(INSUFFICIENT_AVAILABLE_BALANCE)

    if was_held != is_held:
        account.available_balance += -amount if is_held else amount
    if was_done != is_done:
        withdraw_delta = amount if is_done else -amount
        account.total_withdraw = max(Decimal("0"), account.total_withdraw + withdraw_delta)
    session.add(account)


def _apply_transaction_status_change(
    *,
    session: Session,
    user_id: uuid.UUID,
    amount: Decimal,
    transaction_type: TransactionType | str,
    previous_status: TransactionStatus | str | None,
    new_status: TransactionStatus | str | None,
) -> None:
    _apply_deposit_status_change(
        session=session,
        user_id=user_id,
        amount=amount,
        transaction_type=transaction_type,
        previous_status=previous_status,
        new_status=new_status,
    )
    _apply_withdraw_status_change(
        session=session,
        user_id=user_id,
        amount=amount,
        transaction_type=transaction_type,
        previous_status=previous_status,
        new_status=new_status,
    )


def create_transaction(
    *, session: Session, transaction_in: CreateTransaction
) -> Transaction:
    db_obj = Transaction.model_validate(transaction_in)
    session.add(db_obj)
    session.flush()
    _apply_transaction_status_change(
        session=session,
        user_id=db_obj.user_id,
        amount=db_obj.amount,
        transaction_type=db_obj.transaction_type,
        previous_status=None,
        new_status=db_obj.status,
    )
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
    transaction_type: str | None = None,
) -> tuple[list[Transaction], int]:
    filters = [Transaction.user_id == user_id]
    if transaction_type is not None:
        filters.append(Transaction.transaction_type == transaction_type)
    count_statement = select(func.count()).select_from(Transaction).where(*filters)
    count = session.exec(count_statement).one()
    statement = (
        select(Transaction)
        .where(*filters)
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
    previous_status = db_transaction.status
    update_dict = transaction_in.model_dump(exclude_unset=True, mode="json")
    db_transaction.sqlmodel_update(update_dict)
    session.add(db_transaction)
    _apply_transaction_status_change(
        session=session,
        user_id=db_transaction.user_id,
        amount=db_transaction.amount,
        transaction_type=db_transaction.transaction_type,
        previous_status=previous_status,
        new_status=db_transaction.status,
    )
    session.commit()
    session.refresh(db_transaction)
    return db_transaction


def delete_transaction(*, session: Session, db_transaction: Transaction) -> None:
    _apply_transaction_status_change(
        session=session,
        user_id=db_transaction.user_id,
        amount=db_transaction.amount,
        transaction_type=db_transaction.transaction_type,
        previous_status=db_transaction.status,
        new_status=None,
    )
    session.delete(db_transaction)
    session.commit()


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
    row: UserCampaign, *, today: date | None = None, now: datetime | None = None
) -> UserCampaignStatus:
    if row.status == UserCampaignStatus.CANCELLED:
        return UserCampaignStatus.CANCELLED
    if row.status == UserCampaignStatus.COMPLETED or row.settled_at is not None:
        return UserCampaignStatus.COMPLETED
    now = now or datetime.now(timezone.utc)
    if USER_CAMPAIGN_DURATION is not None and row.created_at is not None:
        started_at = row.created_at
        if started_at.tzinfo is None:
            started_at = started_at.replace(tzinfo=timezone.utc)
        if now >= started_at + USER_CAMPAIGN_DURATION:
            return UserCampaignStatus.COMPLETED
    today = today or now.date()
    if row.end_date < today:
        return UserCampaignStatus.COMPLETED
    return UserCampaignStatus.ACTIVE


def snapshot_campaign_metrics(
    campaign: Campaign,
) -> tuple[Decimal, Decimal, Decimal]:
    stats = campaign.stats
    if stats is not None:
        return stats.cpm, stats.epc, stats.ctr
    return (
        campaign.cpm_base,
        midpoint(campaign.epc_min, campaign.epc_max),
        midpoint(campaign.ctr_min, campaign.ctr_max),
    )


def user_campaign_snapshot_metrics(
    row: UserCampaign,
) -> tuple[Decimal, Decimal, Decimal, int]:
    cpm, epc, ctr = (
        (row.cpm, row.epc, row.ctr)
        if row.cpm is not None and row.epc is not None and row.ctr is not None
        else snapshot_campaign_metrics(row.campaign)
        if row.campaign is not None
        else (Decimal("0"), Decimal("0"), Decimal("0"))
    )
    return cpm, epc, ctr, row.participation


def _risk_baseline(row: UserCampaign) -> RiskBaseline:
    return RiskBaseline(
        spent=row.risk_spent or Decimal("0"),
        impressions=row.risk_impressions or 0,
        clicks=row.risk_clicks or 0,
        revenue=row.risk_revenue or Decimal("0"),
    )


def user_campaign_final_economics(row: UserCampaign):
    cpm, epc, ctr, participation = user_campaign_snapshot_metrics(row)
    if row.risk_mode <= 0:
        return estimate_campaign_economics(
            budget=row.budget,
            cpm=cpm,
            epc=epc,
            ctr=ctr,
            participation=participation,
        )
    return project_risk(
        budget=row.budget,
        cpm=cpm,
        epc=epc,
        ctr=ctr,
        participation=participation,
        fraction=Decimal(1),
        risk_mode=row.risk_mode,
        baseline=_risk_baseline(row),
    )


def to_user_campaign_public(row: UserCampaign) -> UserCampaignPublic:
    if row.campaign is None:
        raise ValueError("Campaign is required")
    cpm, epc, ctr, participation = user_campaign_snapshot_metrics(row)
    economics = user_campaign_final_economics(row)
    campaign_public = to_campaign_public(row.campaign)
    campaign_public.stats = CampaignStatsPublic(
        cpm=cpm,
        epc=epc,
        ctr=ctr,
        calculated_at=row.created_at or datetime.now(timezone.utc),
    )
    return UserCampaignPublic(
        id=row.id,
        user_id=row.user_id,
        campaign_id=row.campaign_id,
        start_date=row.start_date,
        end_date=row.end_date,
        budget=row.budget,
        cpm=cpm,
        epc=epc,
        ctr=ctr,
        participation=participation,
        risk_mode=row.risk_mode,
        risk_spent=row.risk_spent or Decimal("0"),
        risk_impressions=row.risk_impressions or 0,
        risk_clicks=row.risk_clicks or 0,
        risk_revenue=row.risk_revenue or Decimal("0"),
        impressions=economics.impressions,
        clicks=economics.clicks,
        gross_revenue=economics.gross_revenue,
        gross_profit=economics.gross_profit,
        net_profit=economics.net_profit,
        status=resolve_user_campaign_status(row),
        created_at=row.created_at,
        settled_at=row.settled_at,
        campaign=campaign_public,
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
    cpm: Decimal,
    epc: Decimal,
    ctr: Decimal,
    participation: int,
) -> UserCampaign:
    db_obj = UserCampaign(
        user_id=user_id,
        campaign_id=campaign_in.campaign_id,
        start_date=campaign_in.start_date,
        end_date=campaign_in.end_date,
        budget=campaign_in.budget,
        cpm=cpm,
        epc=epc,
        ctr=ctr,
        participation=participation,
        status=UserCampaignStatus.ACTIVE,
    )
    session.add(db_obj)
    session.commit()
    loaded = get_user_campaign(session=session, user_campaign_id=db_obj.id)
    assert loaded is not None
    return loaded


def set_user_campaign_risk(
    *,
    session: Session,
    row: UserCampaign,
    risk_mode: int,
    now: datetime | None = None,
) -> UserCampaign:
    now = now or datetime.now(timezone.utc)
    if resolve_user_campaign_status(row, now=now) != UserCampaignStatus.ACTIVE:
        raise ValueError("Risk mode can only be set on an active campaign")

    cpm, epc, ctr, participation = user_campaign_snapshot_metrics(row)
    fraction = delivery_fraction(row.created_at, row.end_date, now)
    if risk_mode <= 0:
        baseline = RiskBaseline(
            spent=Decimal("0"),
            impressions=0,
            clicks=0,
            revenue=Decimal("0"),
        )
        row.risk_mode = 0
    elif row.risk_mode <= 0:
        baseline = natural_baseline(
            budget=row.budget,
            fraction=fraction,
            cpm=cpm,
            epc=epc,
            ctr=ctr,
            participation=participation,
        )
        row.risk_mode = risk_mode
    else:
        current = project_risk(
            budget=row.budget,
            cpm=cpm,
            epc=epc,
            ctr=ctr,
            participation=participation,
            fraction=fraction,
            risk_mode=row.risk_mode,
            baseline=_risk_baseline(row),
        )
        baseline = RiskBaseline(
            spent=current.budget,
            impressions=current.impressions,
            clicks=current.clicks,
            revenue=current.gross_revenue,
        )
        row.risk_mode = risk_mode

    row.risk_spent = baseline.spent
    row.risk_impressions = baseline.impressions
    row.risk_clicks = baseline.clicks
    row.risk_revenue = baseline.revenue
    session.add(row)
    session.commit()
    loaded = get_user_campaign(session=session, user_campaign_id=row.id)
    assert loaded is not None
    return loaded


def settle_completed_user_campaigns(
    session: Session,
    *,
    user_id: uuid.UUID | None = None,
    now: datetime | None = None,
) -> int:
    now = now or datetime.now(timezone.utc)
    statement = select(UserCampaign).where(
        col(UserCampaign.settled_at).is_(None),
        UserCampaign.status != UserCampaignStatus.CANCELLED,
    )
    if user_id is not None:
        statement = statement.where(UserCampaign.user_id == user_id)
    statement = statement.with_for_update()
    rows = list(session.exec(statement).all())
    settled = 0
    for row in rows:
        if resolve_user_campaign_status(row, now=now) != UserCampaignStatus.COMPLETED:
            continue
        campaign = row.campaign or session.get(Campaign, row.campaign_id)
        if campaign is not None and row.campaign is None:
            row.campaign = campaign
        economics = user_campaign_final_economics(row)
        account = session.exec(
            select(Account)
            .where(Account.user_id == row.user_id)
            .with_for_update()
        ).first()
        if account is None:
            continue
        account.available_balance += economics.payout
        account.balance += economics.net_profit
        session.add(account)
        session.add(
            Transaction(
                user_id=row.user_id,
                amount=economics.payout,
                transaction_type=TransactionType.CAMPAIGN_DEPOSIT.value,
                status=TransactionStatus.DONE.value,
                description=campaign.title if campaign is not None else None,
            )
        )
        row.status = UserCampaignStatus.COMPLETED
        row.settled_at = now
        session.add(row)
        settled += 1
    if settled:
        session.commit()
    return settled


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


PROFILE_INCOMPLETE_DETAIL = "Profile data incomplete"
DOCUMENTS_MISSING_DETAIL = "Required documents missing"


def is_profile_complete(user: User) -> bool:
    values = (
        user.name,
        user.last_name,
        user.phone,
        user.country,
        user.city,
        user.address_line_one,
        user.address_line_two,
        user.timezone,
    )
    return all(str(value or "").strip() for value in values)


def has_required_documents(*, session: Session, user_id: uuid.UUID) -> bool:
    rows = session.exec(
        select(UserDocument.document_type).where(UserDocument.user_id == user_id)
    ).all()
    present = {str(item) for item in rows}
    return all(item.value in present for item in REQUIRED_USER_DOCUMENT_TYPES)


def to_user_public(*, session: Session, user: User) -> UserPublic:
    payload = UserPublic.model_validate(user).model_dump()
    payload["profile_complete"] = is_profile_complete(user)
    payload["documents_complete"] = has_required_documents(
        session=session, user_id=user.id
    )
    return UserPublic.model_validate(payload)


def ensure_user_can_start_campaign(*, session: Session, user: User) -> None:
    if not is_profile_complete(user):
        raise ValueError(PROFILE_INCOMPLETE_DETAIL)
    if not has_required_documents(session=session, user_id=user.id):
        raise ValueError(DOCUMENTS_MISSING_DETAIL)


def list_uploaded_user_documents(
    *, session: Session, user_id: uuid.UUID
) -> list[UserDocument]:
    rows = session.exec(
        select(UserDocument).where(UserDocument.user_id == user_id)
    ).all()
    order = {item.value: index for index, item in enumerate(REQUIRED_USER_DOCUMENT_TYPES)}
    return sorted(rows, key=lambda row: order.get(row.document_type, len(order)))


def get_user_document(
    *, session: Session, user_id: uuid.UUID, document_type: UserDocumentType
) -> UserDocument | None:
    return session.exec(
        select(UserDocument).where(
            UserDocument.user_id == user_id,
            UserDocument.document_type == document_type.value,
        )
    ).first()


def list_user_documents(*, session: Session, user_id: uuid.UUID) -> list[UserDocumentPublic]:
    rows = session.exec(
        select(UserDocument).where(UserDocument.user_id == user_id)
    ).all()
    by_type = {row.document_type: row for row in rows}
    documents: list[UserDocumentPublic] = []
    for item in REQUIRED_USER_DOCUMENT_TYPES:
        row = by_type.get(item.value)
        display_name = ""
        if row is not None:
            display_name = row.original_filename.strip() or row.filename.rsplit("/", 1)[-1]
        documents.append(
            UserDocumentPublic(
                document_type=item.value,
                uploaded=row is not None,
                filename=display_name,
            )
        )
    return documents


def upsert_user_document(
    *,
    session: Session,
    user_id: uuid.UUID,
    document_type: UserDocumentType,
    filename: str,
    original_filename: str = "",
) -> UserDocument:
    existing = session.exec(
        select(UserDocument).where(
            UserDocument.user_id == user_id,
            UserDocument.document_type == document_type.value,
        )
    ).first()
    if existing:
        existing.filename = filename
        existing.original_filename = original_filename
        existing.created_at = get_datetime_utc()
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing

    row = UserDocument(
        user_id=user_id,
        document_type=document_type.value,
        filename=filename,
        original_filename=original_filename,
    )
    session.add(row)
    session.commit()
    session.refresh(row)
    return row


def delete_user_document(
    *,
    session: Session,
    user_id: uuid.UUID,
    document_type: UserDocumentType,
) -> str | None:
    existing = session.exec(
        select(UserDocument).where(
            UserDocument.user_id == user_id,
            UserDocument.document_type == document_type.value,
        )
    ).first()
    if existing is None:
        return None
    filename = existing.filename
    session.delete(existing)
    session.commit()
    return filename
