from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime

class UserRegister(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=100)
    password: str = Field(min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    currency: str
    is_active: bool
    auth_provider: str
    created_at: datetime

    model_config = {"from_attributes": True}

class UserUpdate(BaseModel):
    full_name: str | None = None
    currency: str | None = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class ChangePassword(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6)
