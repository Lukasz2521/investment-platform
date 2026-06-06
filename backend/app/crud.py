import uuid
from typing import Any

from sqlmodel import Session, col, func, select

from app.core.security import get_password_hash, verify_password
from app.models import (
    Bank,
    BankCreate,
    BankUpdate,
    Campaign,
    CampaignCreate,
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
    UserCreate,
    UserRegister,
    UserUpdate,
    validate_campaign_metric_ranges,
)


def create_user(*, session: Session, user_create: UserCreate | UserRegister) -> User:
    update_kw: dict[str, Any] = {
        "hashed_password": get_password_hash(user_create.password),
    }
    if isinstance(user_create, UserRegister):
        update_kw["is_active"] = False
    db_obj = User.model_validate(user_create, update=update_kw)
    session.add(db_obj)
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
        .order_by(col(Campaign.created_at).desc())
        .offset(skip)
        .limit(limit)
    )
    rows = session.exec(statement).all()
    return list(rows), count


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
