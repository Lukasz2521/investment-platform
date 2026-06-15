import uuid
from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum
from typing import Self

from pydantic import ConfigDict, EmailStr, model_validator
from sqlalchemy import Column, DateTime, Numeric, UniqueConstraint
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, Relationship, SQLModel


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserRegister(SQLModel):
    username: str = Field(max_length=255)
    name: str = Field(max_length=255)
    last_name: str = Field(max_length=255)
    email: EmailStr = Field(max_length=255)
    phone: str = Field(max_length=255)
    country: str = Field(max_length=255)
    city: str = Field(max_length=255)
    address_line_one: str = Field(max_length=255)
    address_line_two: str = Field(max_length=255)
    timezone: str = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore[assignment]
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UserLogin(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    username: str = Field(default="", max_length=255)
    name: str = Field(default="", max_length=255)
    last_name: str = Field(default="", max_length=255)
    phone: str = Field(default="", max_length=255)
    country: str = Field(default="", max_length=255)
    city: str = Field(default="", max_length=255)
    address_line_one: str = Field(default="", max_length=255)
    address_line_two: str = Field(default="", max_length=255)
    timezone: str = Field(default="", max_length=255)
    items: list["Item"] = Relationship(back_populates="owner", cascade_delete=True)
    transactions: list["Transaction"] = Relationship(
        back_populates="user", cascade_delete=True
    )
    account: "Account" = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"uselist": False},
        cascade_delete=True,
    )


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID
    created_at: datetime | None = None
    username: str = Field(default="", max_length=255)
    name: str = Field(default="", max_length=255)
    last_name: str = Field(default="", max_length=255)
    phone: str = Field(default="", max_length=255)
    country: str = Field(default="", max_length=255)
    city: str = Field(default="", max_length=255)
    address_line_one: str = Field(default="", max_length=255)
    address_line_two: str = Field(default="", max_length=255)
    timezone: str = Field(default="", max_length=255)


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Shared properties
class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)


# Properties to receive on item creation
class ItemCreate(ItemBase):
    pass


# Properties to receive on item update
class ItemUpdate(ItemBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore[assignment]


# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="items")


# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime | None = None


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)


# Transaction model


class Transaction(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE", index=True
    )
    amount: Decimal = Field(sa_column=Column(Numeric(18, 4), nullable=False))
    transaction_type: str = Field(max_length=64)
    description: str | None = Field(default=None, max_length=1024)
    status: str = Field(max_length=64)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    user: User | None = Relationship(back_populates="transactions")


class TransactionPublic(SQLModel):
    id: uuid.UUID
    user_id: uuid.UUID
    amount: Decimal
    transaction_type: str
    description: str | None = None
    status: str
    created_at: datetime | None = None


class TransactionsPublic(SQLModel):
    data: list[TransactionPublic]
    count: int


class TransactionType(str, Enum):
    CAMPAIGN_WITHDRAW = "campaign_withdraw"
    CAMPAIGN_DEPOSIT = "campaign_deposit"
    DEPOSIT = "deposit"
    WITHDRAW = "withdraw"
    REFUND = "refund"


class TransactionStatus(str, Enum):
    PENDING = "pending"
    DONE = "done"
    FAILED = "failed"


class CreateTransaction(SQLModel):
    model_config = ConfigDict(populate_by_name=True)  # type: ignore[assignment]

    amount: Decimal
    transaction_type: TransactionType = Field(alias="type")
    status: TransactionStatus = Field(max_length=64)
    user_id: uuid.UUID = Field(alias="userId")
    description: str | None = Field(default=None, max_length=1024)


class UpdateTransaction(SQLModel):
    status: TransactionStatus
    description: str | None = Field(default=None, max_length=1024)


# Campaign model


class Category(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(max_length=255, unique=True, index=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    campaigns: list["Campaign"] = Relationship(back_populates="category")


class CategoryCreate(SQLModel):
    name: str = Field(min_length=1, max_length=255)


class CategoryPublic(SQLModel):
    id: uuid.UUID
    name: str
    created_at: datetime | None = None


class CategoryUpdate(SQLModel):
    name: str = Field(min_length=1, max_length=255)


class AccountType(str, Enum):
    FUNDAMENT = "fundament"
    ACCELERATOR = "accelerator"
    STRATEGY = "strategy"
    ALPHA = "alpha"
    PROTECTOR = "protector"
    DOMINION = "dominion"


def validate_campaign_metric_ranges(
    *,
    cpm_min: Decimal,
    cpm_base: Decimal,
    cpm_max: Decimal,
    epc_min: Decimal,
    epc_max: Decimal,
    ctr_min: Decimal,
    ctr_max: Decimal,
) -> None:
    if cpm_min > cpm_max:
        msg = "cpm_min cannot be greater than cpm_max"
        raise ValueError(msg)
    if cpm_base > cpm_max:
        msg = "cpm_base cannot be greater than cpm_max"
        raise ValueError(msg)
    if epc_min > epc_max:
        msg = "epc_min cannot be greater than epc_max"
        raise ValueError(msg)
    if ctr_min > ctr_max:
        msg = "ctr_min cannot be greater than ctr_max"
        raise ValueError(msg)


class Campaign(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(max_length=255)
    min_days: int = Field(ge=3)
    days_count: int = Field(ge=3)
    category_id: uuid.UUID = Field(
        foreign_key="category.id", nullable=False, ondelete="RESTRICT", index=True
    )
    budget: Decimal = Field(sa_column=Column(Numeric(18, 4), nullable=False))
    currency: str = Field(max_length=8)
    cpm_base: Decimal = Field(sa_column=Column(Numeric(18, 4), nullable=False))
    cpm_min: Decimal = Field(sa_column=Column(Numeric(18, 4), nullable=False))
    cpm_max: Decimal = Field(sa_column=Column(Numeric(18, 4), nullable=False))
    epc_min: Decimal = Field(sa_column=Column(Numeric(18, 4), nullable=False))
    epc_max: Decimal = Field(sa_column=Column(Numeric(18, 4), nullable=False))
    ctr_min: Decimal = Field(sa_column=Column(Numeric(18, 4), nullable=False))
    ctr_max: Decimal = Field(sa_column=Column(Numeric(18, 4), nullable=False))
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    location: list[str] = Field(
        default_factory=list,
        sa_column=Column(JSONB, nullable=False),
    )
    min_account: AccountType = Field(
        sa_column=Column(
            SAEnum(AccountType, native_enum=False, length=64),
            nullable=False,
        ),
    )
    category: Category | None = Relationship(back_populates="campaigns")
    image_url: str = Field(max_length=255)
    video_url: str = Field(max_length=255)


class CampaignCreate(SQLModel):
    model_config = ConfigDict(populate_by_name=True)  # type: ignore[assignment]

    title: str = Field(max_length=255)
    min_days: int = Field(ge=3)
    days_count: int = Field(ge=3)
    category_id: uuid.UUID = Field(alias="categoryId")
    budget: Decimal = Field(ge=200)
    currency: str = Field(max_length=8)
    cpm_base: Decimal = Field()
    cpm_min: Decimal = Field()
    cpm_max: Decimal = Field()
    epc_min: Decimal = Field(ge=0, le=100)
    epc_max: Decimal = Field(ge=0, le=100)
    ctr_min: Decimal = Field(ge=0, le=100)
    ctr_max: Decimal = Field(ge=0, le=100)
    location: list[str] = Field(min_length=1)
    min_account: AccountType
    image_url: str = Field(max_length=255)
    video_url: str = Field(max_length=255)

    @model_validator(mode="after")
    def validate_campaign_metrics_order(self) -> Self:
        validate_campaign_metric_ranges(
            cpm_min=self.cpm_min,
            cpm_base=self.cpm_base,
            cpm_max=self.cpm_max,
            epc_min=self.epc_min,
            epc_max=self.epc_max,
            ctr_min=self.ctr_min,
            ctr_max=self.ctr_max,
        )
        return self


class CampaignUpdate(SQLModel):
    model_config = ConfigDict(populate_by_name=True)  # type: ignore[assignment]

    title: str | None = Field(default=None, max_length=255)
    min_days: int | None = Field(default=None, ge=3)
    days_count: int | None = Field(default=None, ge=3)
    category_id: uuid.UUID | None = Field(default=None, alias="categoryId")
    budget: Decimal | None = Field(default=None, ge=200)
    currency: str | None = Field(default=None, max_length=8)
    cpm_base: Decimal | None = None
    cpm_min: Decimal | None = None
    cpm_max: Decimal | None = None
    epc_min: Decimal | None = Field(default=None, ge=0, le=100)
    epc_max: Decimal | None = Field(default=None, ge=0, le=100)
    ctr_min: Decimal | None = Field(default=None, ge=0, le=100)
    ctr_max: Decimal | None = Field(default=None, ge=0, le=100)
    location: list[str] | None = Field(default=None, min_length=1)
    min_account: AccountType | None = None
    image_url: str | None = Field(default=None, max_length=255)
    video_url: str | None = Field(default=None, max_length=255)


class CampaignPublic(SQLModel):
    id: uuid.UUID
    title: str
    min_days: int
    days_count: int
    category_id: uuid.UUID
    budget: Decimal
    currency: str
    cpm_base: Decimal
    cpm_min: Decimal
    cpm_max: Decimal
    epc_min: Decimal
    epc_max: Decimal
    ctr_min: Decimal
    ctr_max: Decimal
    created_at: datetime | None = None
    location: list[str]
    min_account: AccountType
    image_url: str
    video_url: str


class CampaignsPublic(SQLModel):
    data: list[CampaignPublic]
    count: int


# Bank model


class BankBase(SQLModel):
    name: str = Field(max_length=255)
    bank_address: str = Field(default="", max_length=512)
    account_name: str = Field(default="", max_length=255)
    iban: str = Field(default="", max_length=34)
    sepa: str = Field(max_length=64)
    swift: str = Field(default="", max_length=11)
    company_address: str = Field(default="", max_length=512)
    transfer_title: str = Field(default="", max_length=255)
    bank_description: str | None = Field(default=None, max_length=1024)
    bank_logo: str = Field(default="", max_length=512)


class Bank(BankBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore[assignment]
    )
    accounts: list["AccountBank"] = Relationship(back_populates="bank", cascade_delete=True)


class BankCreate(BankBase):
    pass


class BankUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=255)
    bank_address: str | None = Field(default=None, max_length=512)
    account_name: str | None = Field(default=None, max_length=255)
    iban: str | None = Field(default=None, max_length=34)
    sepa: str | None = Field(default=None, max_length=64)
    swift: str | None = Field(default=None, max_length=11)
    company_address: str | None = Field(default=None, max_length=512)
    transfer_title: str | None = Field(default=None, max_length=255)
    bank_description: str | None = Field(default=None, max_length=1024)
    bank_logo: str | None = Field(default=None, max_length=512)


class BankPublic(BankBase):
    id: uuid.UUID
    created_at: datetime | None = None


class AccountBankPublic(SQLModel):
    id: uuid.UUID
    is_enabled: bool
    bank: BankPublic


class BanksPublic(SQLModel):
    data: list[BankPublic]
    count: int


# Account model


class AccountBase(SQLModel):
    account_type: AccountType = AccountType.FUNDAMENT
    participation: int = Field(default=0, ge=0, le=100)
    balance: Decimal = Field(default=Decimal("0"), ge=0)
    available_balance: Decimal = Field(default=Decimal("0"))
    total_deposit: Decimal = Field(default=Decimal("0"), ge=0)
    total_withdraw: Decimal = Field(default=Decimal("0"), ge=0)
    custom_campaigns: bool = True
    card_payments: bool = False


class Account(AccountBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(
        foreign_key="user.id",
        nullable=False,
        unique=True,
        ondelete="CASCADE",
        index=True,
    )
    account_type: AccountType = Field(
        default=AccountType.FUNDAMENT,
        sa_column=Column(
            SAEnum(AccountType, native_enum=False, length=64),
            nullable=False,
        ),
    )
    participation: int = Field(default=18, ge=0, le=100)
    balance: Decimal = Field(
        default=Decimal("0"),
        sa_column=Column(Numeric(18, 4), nullable=False),
    )
    available_balance: Decimal = Field(
        default=Decimal("0"),
        sa_column=Column(Numeric(18, 4), nullable=False),
    )
    total_deposit: Decimal = Field(
        default=Decimal("0"),
        sa_column=Column(Numeric(18, 4), nullable=False),
    )
    total_withdraw: Decimal = Field(
        default=Decimal("0"),
        sa_column=Column(Numeric(18, 4), nullable=False),
    )
    custom_campaigns: bool = Field(default=False)
    card_payments: bool = Field(default=False)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore[assignment]
    )
    user: User | None = Relationship(back_populates="account")
    banks: list["AccountBank"] = Relationship(back_populates="account", cascade_delete=True)


class AccountCreate(SQLModel):
    model_config = ConfigDict(populate_by_name=True)  # type: ignore[assignment]

    user_id: uuid.UUID = Field(alias="userId")
    account_type: AccountType = AccountType.DOMINION
    participation: int = Field(default=0, ge=0, le=100)
    balance: Decimal = Field(default=Decimal("0"), ge=0)
    available_balance: Decimal = Field(default=Decimal("0"))
    total_deposit: Decimal = Field(default=Decimal("0"), ge=0)
    total_withdraw: Decimal = Field(default=Decimal("0"), ge=0)
    custom_campaigns: bool = True
    card_payments: bool = False


class AccountUpdate(SQLModel):
    model_config = ConfigDict(populate_by_name=True)  # type: ignore[assignment]

    account_type: AccountType | None = None
    participation: int | None = Field(default=None, ge=0, le=100)
    balance: Decimal | None = Field(default=None, ge=0)
    available_balance: Decimal | None = None
    total_deposit: Decimal | None = Field(default=None, ge=0)
    total_withdraw: Decimal | None = Field(default=None, ge=0)
    custom_campaigns: bool | None = None
    card_payments: bool | None = None


class AccountPublic(AccountBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime | None = None
    banks: list[AccountBankPublic] = Field(default_factory=list)

    @classmethod
    def from_account(cls, account: "Account") -> Self:
        return cls(
            **AccountBase.model_validate(account).model_dump(),
            id=account.id,
            user_id=account.user_id,
            created_at=account.created_at,
            banks=_account_banks_from_account(account),
        )


class AccountPublicForUser(AccountBase):
    created_at: datetime | None = None
    banks: list[AccountBankPublic] = Field(default_factory=list)

    @classmethod
    def from_account(cls, account: "Account") -> Self:
        return cls(
            **AccountBase.model_validate(account).model_dump(),
            created_at=account.created_at,
            banks=_account_banks_from_account(account),
        )


class UserPublicWithAccount(UserPublic):
    account: AccountPublicForUser | None = None


class AccountBank(SQLModel, table=True):
    __tablename__ = "account_bank"
    __table_args__ = (UniqueConstraint("account_id", "bank_id"),)

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    account_id: uuid.UUID = Field(
        foreign_key="account.id", nullable=False, ondelete="CASCADE", index=True
    )
    bank_id: uuid.UUID = Field(
        foreign_key="bank.id", nullable=False, ondelete="CASCADE", index=True
    )
    is_enabled: bool = Field(default=False)
    account: Account | None = Relationship(back_populates="banks")
    bank: Bank | None = Relationship(back_populates="accounts")


def _account_banks_from_account(account: "Account") -> list[AccountBankPublic]:
    return [
        AccountBankPublic(
            id=link.id,
            is_enabled=link.is_enabled,
            bank=BankPublic.model_validate(link.bank),
        )
        for link in account.banks
        if link.bank is not None
    ]