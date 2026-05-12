import uuid
from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum

from pydantic import ConfigDict, EmailStr
from sqlalchemy import Column, DateTime, Numeric
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
