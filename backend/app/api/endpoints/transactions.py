import math
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from uuid import UUID
from datetime import date
from decimal import Decimal
from app.core.database import get_db
from app.models.transaction import Transaction
from app.models.wallet import Wallet
from app.models.category import Category
from app.models.user import User
from app.schemas.transaction import (
    TransactionCreate, TransactionUpdate, TransactionResponse, TransactionListResponse,
    TransactionParseRequest, TransactionParseResponse,
)
from app.api.dependencies import get_current_user, rate_limit_ai
from app.services.transaction_parser import parse_transaction_text, TransactionParseError

router = APIRouter()

@router.post("/parse", response_model=TransactionParseResponse)
def parse_transaction(
    data: TransactionParseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(rate_limit_ai),
):
    """
    NLP Quick-Add (design doc section 13) — parse a natural-language Vietnamese
    sentence (e.g. "ăn trưa 20k") into a transaction draft. Nothing is saved;
    the client must POST the (optionally edited) result to `/transactions` to
    actually create it. Rate limited to 20 requests/minute/user.
    """
    try:
        draft = parse_transaction_text(db=db, user_id=current_user.id, text=data.text)
    except TransactionParseError as exc:
        raise HTTPException(status_code=422, detail=exc.message)
    return TransactionParseResponse(**draft)

@router.get("", response_model=TransactionListResponse)
def list_transactions(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    type: str | None = Query(None, pattern="^(income|expense)$"),
    category_id: UUID | None = None,
    wallet_id: UUID | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)

    if type:
        query = query.filter(Transaction.type == type)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    if wallet_id:
        query = query.filter(Transaction.wallet_id == wallet_id)
    if from_date:
        query = query.filter(Transaction.transaction_date >= from_date)
    if to_date:
        query = query.filter(Transaction.transaction_date <= to_date)
    if search:
        query = query.filter(Transaction.description.ilike(f"%{search}%"))

    total = query.count()
    total_pages = math.ceil(total / per_page) if total > 0 else 1

    items = (
        query
        .options(joinedload(Transaction.category), joinedload(Transaction.wallet))
        .order_by(desc(Transaction.transaction_date), desc(Transaction.created_at))
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return TransactionListResponse(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )

@router.post("", response_model=TransactionResponse, status_code=201)
def create_transaction(
    data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validate category
    category = db.query(Category).filter(Category.id == data.category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="Danh mục không tồn tại")
    if category.type != data.type:
        raise HTTPException(status_code=400, detail=f"Danh mục '{category.name}' không phải loại {data.type}")

    # Validate wallet if provided
    if data.wallet_id:
        wallet = db.query(Wallet).filter(
            Wallet.id == data.wallet_id, Wallet.user_id == current_user.id
        ).first()
        if not wallet:
            raise HTTPException(status_code=400, detail="Ví không tồn tại")
        # Update wallet balance
        if data.type == "income":
            wallet.balance = wallet.balance + data.amount
        else:
            wallet.balance = wallet.balance - data.amount

    transaction = Transaction(user_id=current_user.id, **data.model_dump())
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    # Reload with relationships
    transaction = (
        db.query(Transaction)
        .options(joinedload(Transaction.category), joinedload(Transaction.wallet))
        .filter(Transaction.id == transaction.id)
        .first()
    )
    return transaction

@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction = (
        db.query(Transaction)
        .options(joinedload(Transaction.category), joinedload(Transaction.wallet))
        .filter(Transaction.id == transaction_id, Transaction.user_id == current_user.id)
        .first()
    )
    if not transaction:
        raise HTTPException(status_code=404, detail="Giao dịch không tồn tại")
    return transaction

@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: UUID,
    data: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id, Transaction.user_id == current_user.id
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Giao dịch không tồn tại")

    # Handle wallet balance changes if amount or type changed
    old_amount = transaction.amount
    old_type = transaction.type
    old_wallet_id = transaction.wallet_id

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(transaction, key, value)

    # Revert old wallet balance and apply new
    if old_wallet_id:
        old_wallet = db.query(Wallet).filter(Wallet.id == old_wallet_id).first()
        if old_wallet:
            if old_type == "income":
                old_wallet.balance = old_wallet.balance - old_amount
            else:
                old_wallet.balance = old_wallet.balance + old_amount

    if transaction.wallet_id:
        new_wallet = db.query(Wallet).filter(Wallet.id == transaction.wallet_id).first()
        if new_wallet:
            if transaction.type == "income":
                new_wallet.balance = new_wallet.balance + transaction.amount
            else:
                new_wallet.balance = new_wallet.balance - transaction.amount

    db.commit()

    transaction = (
        db.query(Transaction)
        .options(joinedload(Transaction.category), joinedload(Transaction.wallet))
        .filter(Transaction.id == transaction.id)
        .first()
    )
    return transaction

@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id, Transaction.user_id == current_user.id
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Giao dịch không tồn tại")

    # Revert wallet balance
    if transaction.wallet_id:
        wallet = db.query(Wallet).filter(Wallet.id == transaction.wallet_id).first()
        if wallet:
            if transaction.type == "income":
                wallet.balance = wallet.balance - transaction.amount
            else:
                wallet.balance = wallet.balance + transaction.amount

    db.delete(transaction)
    db.commit()
    return {"message": "Đã xóa giao dịch"}
