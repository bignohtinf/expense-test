from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from decimal import Decimal

class BudgetCreate(BaseModel):
    category_id: UUID | None = None  # None = total budget
    amount: Decimal = Field(gt=0)
    month: int = Field(ge=1, le=12)
    year: int = Field(ge=2020, le=2100)

class BudgetUpdate(BaseModel):
    amount: Decimal | None = Field(default=None, gt=0)

class BudgetResponse(BaseModel):
    id: UUID
    category_id: UUID | None
    amount: Decimal
    spent: Decimal = Decimal("0")
    remaining: Decimal = Decimal("0")
    percentage: float = 0.0
    month: int
    year: int
    created_at: datetime
    category: "BudgetCategoryInfo | None" = None

    model_config = {"from_attributes": True}

class BudgetCategoryInfo(BaseModel):
    id: UUID
    name: str
    icon: str
    color: str
    model_config = {"from_attributes": True}

BudgetResponse.model_rebuild()
