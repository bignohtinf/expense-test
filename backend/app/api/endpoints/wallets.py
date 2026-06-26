from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.models.wallet import Wallet
from app.models.user import User
from app.schemas.wallet import WalletCreate, WalletUpdate, WalletResponse
from app.api.dependencies import get_current_user

router = APIRouter()

@router.get("", response_model=list[WalletResponse])
def list_wallets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    wallets = db.query(Wallet).filter(
        Wallet.user_id == current_user.id,
        Wallet.is_active == True,
    ).order_by(Wallet.created_at).all()
    return wallets

@router.post("", response_model=WalletResponse, status_code=201)
def create_wallet(data: WalletCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    wallet = Wallet(user_id=current_user.id, **data.model_dump())
    db.add(wallet)
    db.commit()
    db.refresh(wallet)
    return wallet

@router.put("/{wallet_id}", response_model=WalletResponse)
def update_wallet(wallet_id: UUID, data: WalletUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    wallet = db.query(Wallet).filter(Wallet.id == wallet_id, Wallet.user_id == current_user.id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Ví không tồn tại")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(wallet, key, value)
    db.commit()
    db.refresh(wallet)
    return wallet

@router.delete("/{wallet_id}")
def delete_wallet(wallet_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    wallet = db.query(Wallet).filter(Wallet.id == wallet_id, Wallet.user_id == current_user.id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Ví không tồn tại")
    wallet.is_active = False
    db.commit()
    return {"message": "Đã xóa ví"}
