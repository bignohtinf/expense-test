from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime

class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    type: str = Field(pattern="^(income|expense)$")
    icon: str = Field(default="tag")
    color: str = Field(default="#6b7280", pattern="^#[0-9a-fA-F]{6}$")

class CategoryUpdate(BaseModel):
    name: str | None = None
    icon: str | None = None
    color: str | None = None

class CategoryResponse(BaseModel):
    id: UUID
    name: str
    type: str
    icon: str
    color: str
    is_default: bool
    created_at: datetime

    model_config = {"from_attributes": True}
