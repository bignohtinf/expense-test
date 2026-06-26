from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from uuid import UUID
from datetime import date, datetime
from decimal import Decimal
from app.core.database import get_db
from app.models.budget import Budget
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetResponse
from app.api.dependencies import get_current_user

router = APIRouter()

def _enrich_budget(budget: Budget, db: Session, user_id) -> BudgetResponse:
    """Calculate spent amount for a budget."""
    query = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        func.extract("month", Transaction.transaction_date) == budget.month,
        func.extract("year", Transaction.transaction_date) == budget.year,
    )
    if budget.category_id:
        query = query.filter(Transaction.category_id == budget.category_id)

    spent = query.scalar()
    spent = Decimal(str(spent))
    remaining = budget.amount - spent
    percentage = float(spent / budget.amount * 100) if budget.amount > 0 else 0.0

    result = BudgetResponse.model_validate(budget)
    result.spent = spent
    result.remaining = remaining
    result.percentage = round(percentage, 1)
    return result

@router.get("", response_model=list[BudgetResponse])
def list_budgets(
    month: int = Query(default_factory=lambda: date.today().month, ge=1, le=12),
    year: int = Query(default_factory=lambda: date.today().year, ge=2020),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budgets = (
        db.query(Budget)
        .options(joinedload(Budget.category))
        .filter(Budget.user_id == current_user.id, Budget.month == month, Budget.year == year)
        .all()
    )
    return [_enrich_budget(b, db, current_user.id) for b in budgets]

@router.post("", response_model=BudgetResponse, status_code=201)
def create_budget(
    data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check duplicate
    existing = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.category_id == data.category_id,
        Budget.month == data.month,
        Budget.year == data.year,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Budget cho danh mục này trong tháng đã tồn tại")

    budget = Budget(user_id=current_user.id, **data.model_dump())
    db.add(budget)
    db.commit()
    db.refresh(budget)

    budget = db.query(Budget).options(joinedload(Budget.category)).filter(Budget.id == budget.id).first()
    return _enrich_budget(budget, db, current_user.id)

@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: UUID,
    data: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget không tồn tại")

    if data.amount is not None:
        budget.amount = data.amount
    db.commit()
    db.refresh(budget)

    budget = db.query(Budget).options(joinedload(Budget.category)).filter(Budget.id == budget.id).first()
    return _enrich_budget(budget, db, current_user.id)

@router.delete("/{budget_id}")
def delete_budget(
    budget_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget không tồn tại")
    db.delete(budget)
    db.commit()
    return {"message": "Đã xóa budget"}
