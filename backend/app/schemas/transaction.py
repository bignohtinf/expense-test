from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime, date
from decimal import Decimal

class TransactionCreate(BaseModel):
    category_id: UUID
    wallet_id: UUID | None = None
    type: str = Field(pattern="^(income|expense)$")
    amount: Decimal = Field(gt=0)
    description: str = Field(default="")
    transaction_date: date = Field(default_factory=date.today)

class TransactionUpdate(BaseModel):
    category_id: UUID | None = None
    wallet_id: UUID | None = None
    type: str | None = None
    amount: Decimal | None = None
    description: str | None = None
    transaction_date: date | None = None

class TransactionResponse(BaseModel):
    id: UUID
    category_id: UUID
    wallet_id: UUID | None
    type: str
    amount: Decimal
    description: str
    transaction_date: date
    created_at: datetime
    category: "CategoryInfo | None" = None
    wallet: "WalletInfo | None" = None

    model_config = {"from_attributes": True}

class CategoryInfo(BaseModel):
    id: UUID
    name: str
    icon: str
    color: str
    model_config = {"from_attributes": True}

class WalletInfo(BaseModel):
    id: UUID
    name: str
    type: str
    model_config = {"from_attributes": True}

# Update forward refs
TransactionResponse.model_rebuild()

class TransactionListResponse(BaseModel):
    items: list[TransactionResponse]
    total: int
    page: int
    per_page: int
    total_pages: int
