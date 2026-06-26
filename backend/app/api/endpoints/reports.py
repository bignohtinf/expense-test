from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import date
from decimal import Decimal
from app.core.database import get_db
from app.models.transaction import Transaction
from app.models.category import Category
from app.models.user import User
from app.api.dependencies import get_current_user
from app.utils.date_helpers import month_date_range


router = APIRouter()


def _month_filter(month: int, year: int):
    """Return SQLAlchemy filter clauses using date range (index-friendly)."""
    start, end = month_date_range(month, year)
    return [
        Transaction.transaction_date >= start,
        Transaction.transaction_date < end,
    ]


@router.get("/summary")
def get_summary(
    month: int = Query(default_factory=lambda: date.today().month, ge=1, le=12),
    year: int = Query(default_factory=lambda: date.today().year),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    results = db.query(
        Transaction.type,
        func.coalesce(func.sum(Transaction.amount), 0),
        func.count(Transaction.id),
    ).filter(
        Transaction.user_id == current_user.id,
        *_month_filter(month, year),
    ).group_by(Transaction.type).all()

    total_income = Decimal("0")
    total_expense = Decimal("0")
    transaction_count = 0

    for tx_type, total, count in results:
        if tx_type == "income":
            total_income = Decimal(str(total))
        else:
            total_expense = Decimal(str(total))
        transaction_count += count

    return {
        "month": month,
        "year": year,
        "total_income": total_income,
        "total_expense": total_expense,
        "net": total_income - total_expense,
        "transaction_count": transaction_count,
    }


@router.get("/by-category")
def get_by_category(
    month: int = Query(default_factory=lambda: date.today().month, ge=1, le=12),
    year: int = Query(default_factory=lambda: date.today().year),
    type: str = Query("expense", pattern="^(income|expense)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    results = (
        db.query(
            Category.id,
            Category.name,
            Category.icon,
            Category.color,
            func.coalesce(func.sum(Transaction.amount), 0).label("total"),
            func.count(Transaction.id).label("count"),
        )
        .join(Transaction, Transaction.category_id == Category.id)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.type == type,
            *_month_filter(month, year),
        )
        .group_by(Category.id, Category.name, Category.icon, Category.color)
        .order_by(func.sum(Transaction.amount).desc())
        .all()
    )

    grand_total = sum(Decimal(str(r.total)) for r in results)

    return [
        {
            "category_id": str(r.id),
            "category_name": r.name,
            "icon": r.icon,
            "color": r.color,
            "total": Decimal(str(r.total)),
            "count": r.count,
            "percentage": round(float(Decimal(str(r.total)) / grand_total * 100), 1) if grand_total > 0 else 0,
        }
        for r in results
    ]


@router.get("/trend")
def get_trend(
    months: int = Query(6, ge=1, le=24),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Trend needs EXTRACT for grouping -- acceptable because WHERE
    # clause uses user_id index, and GROUP BY runs on filtered result set.
    results = (
        db.query(
            extract("year", Transaction.transaction_date).label("year"),
            extract("month", Transaction.transaction_date).label("month"),
            Transaction.type,
            func.coalesce(func.sum(Transaction.amount), 0).label("total"),
        )
        .filter(Transaction.user_id == current_user.id)
        .group_by("year", "month", Transaction.type)
        .order_by("year", "month")
        .all()
    )

    trend = {}
    for r in results:
        key = f"{int(r.year)}-{int(r.month):02d}"
        if key not in trend:
            trend[key] = {"month": key, "income": Decimal("0"), "expense": Decimal("0")}
        trend[key][r.type] = Decimal(str(r.total))

    sorted_trend = sorted(trend.values(), key=lambda x: x["month"])
    return sorted_trend[-months:]


@router.get("/daily")
def get_daily(
    month: int = Query(default_factory=lambda: date.today().month, ge=1, le=12),
    year: int = Query(default_factory=lambda: date.today().year),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    results = (
        db.query(
            Transaction.transaction_date,
            Transaction.type,
            func.coalesce(func.sum(Transaction.amount), 0).label("total"),
        )
        .filter(
            Transaction.user_id == current_user.id,
            *_month_filter(month, year),
        )
        .group_by(Transaction.transaction_date, Transaction.type)
        .order_by(Transaction.transaction_date)
        .all()
    )

    daily = {}
    for r in results:
        day = r.transaction_date.isoformat()
        if day not in daily:
            daily[day] = {"date": day, "income": Decimal("0"), "expense": Decimal("0")}
        daily[day][r.type] = Decimal(str(r.total))

    return sorted(daily.values(), key=lambda x: x["date"])
