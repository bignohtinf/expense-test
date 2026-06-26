from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from decimal import Decimal

class WalletCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    type: str = Field(default="cash", pattern="^(cash|bank|e_wallet|credit_card)$")
    balance: Decimal = Field(default=Decimal("0"))
    icon: str = Field(default="wallet")

class WalletUpdate(BaseModel):
    name: str | None = None
    type: str | None = None
    icon: str | None = None

class WalletResponse(BaseModel):
    id: UUID
    name: str
    balance: Decimal
    type: str
    icon: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
