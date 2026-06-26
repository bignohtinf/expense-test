from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    create_access_token, create_refresh_token,
    verify_password, get_password_hash, verify_token,
)
from app.models.user import User
from app.models.wallet import Wallet
from app.schemas.user import (
    UserRegister, UserLogin, UserResponse, UserUpdate,
    TokenResponse, ChangePassword,
)
from app.api.dependencies import get_current_user
from app.utils.seed import seed_default_categories

router = APIRouter()

@router.post("/register", response_model=TokenResponse, status_code=201)
def register(data: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email đã được đăng ký")

    user = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=get_password_hash(data.password),
    )
    db.add(user)
    db.flush()

    # Create default wallet
    wallet = Wallet(user_id=user.id, name="Tiền mặt", type="cash")
    db.add(wallet)

    # Seed default categories if needed
    seed_default_categories(db)

    db.commit()
    db.refresh(user)

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )

@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không chính xác")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Tài khoản đã bị khóa")

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )

@router.post("/refresh", response_model=dict)
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    payload = verify_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Refresh token không hợp lệ")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=401, detail="User không tồn tại")

    new_access = create_access_token({"sub": str(user.id)})
    return {"access_token": new_access, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_me(data: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if data.full_name is not None:
        current_user.full_name = data.full_name
    if data.currency is not None:
        current_user.currency = data.currency
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/change-password")
def change_password(data: ChangePassword, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Mật khẩu hiện tại không chính xác")
    current_user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    return {"message": "Đổi mật khẩu thành công"}
