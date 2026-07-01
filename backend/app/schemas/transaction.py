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

# --- NLP Quick-Add (design doc section 13) ---

class TransactionParseRequest(BaseModel):
    text: str = Field(min_length=1, max_length=200)

class TransactionParseResponse(BaseModel):
    amount: Decimal
    type: str
    category_id: UUID
    category_name: str
    description: str
    transaction_date: date
    confidence: float
    raw_text: str
