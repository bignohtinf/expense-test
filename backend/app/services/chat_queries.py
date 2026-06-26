"""
Optimized query functions for the Chat feature.

Each function:
- Uses date-range filters instead of EXTRACT() → enables Index Scan
- Always scopes by user_id → security + uses composite index leading column
- Returns plain dicts ready for OpenAI formatting

Index usage mapping:
  get_monthly_summary      → ix_transactions_user_date (range scan)
  get_spending_by_category → ix_transactions_user_type_date (range scan + type)
  compare_months           → ix_transactions_user_date (two range scans)
  get_top_transactions     → ix_transactions_user_date_amount (range + sort)
  get_budget_status        → ix_budgets_user_month_year + ix_transactions_user_category
  get_recent_transactions  → ix_transactions_user_type_date (backward scan)
"""

from decimal import Decimal
from typing import Optional
from uuid import UUID

from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.models.category import Category
from app.models.budget import Budget
from app.utils.date_helpers import month_date_range


def _date_filters(month: int, year: int):
    start, end = month_date_range(month, year)
    return [
        Transaction.transaction_date >= start,
        Transaction.transaction_date < end,
    ]


def get_monthly_summary(db: Session, user_id: UUID, month: int, year: int) -> dict:
    """
    Index: ix_transactions_user_date
    Query plan: Index Scan on (user_id, transaction_date) with range
    """
    rows = (
        db.query(
            Transaction.type,
            func.coalesce(func.sum(Transaction.amount), 0).label("total"),
            func.count(Transaction.id).label("count"),
        )
        .filter(Transaction.user_id == user_id, *_date_filters(month, year))
        .group_by(Transaction.type)
        .all()
    )

    income = Decimal("0")
    expense = Decimal("0")
    tx_count = 0
    for r in rows:
        if r.type == "income":
            income = Decimal(str(r.total))
        else:
            expense = Decimal(str(r.total))
        tx_count += r.count

    return {
        "month": month,
        "year": year,
        "total_income": float(income),
        "total_expense": float(expense),
        "net": float(income - expense),
        "transaction_count": tx_count,
    }


def get_spending_by_category(
    db: Session, user_id: UUID, month: int, year: int, top_n: int = 10
) -> dict:
    """
    Index: ix_transactions_user_type_date (user_id, type='expense', date range)
    then joins categories (small table, no perf concern)
    """
    rows = (
        db.query(
            Category.name,
            func.coalesce(func.sum(Transaction.amount), 0).label("total"),
            func.count(Transaction.id).label("count"),
        )
        .join(Transaction, Transaction.category_id == Category.id)
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            *_date_filters(month, year),
        )
        .group_by(Category.id, Category.name)
        .order_by(desc("total"))
        .limit(top_n)
        .all()
    )

    grand_total = sum(Decimal(str(r.total)) for r in rows)
    categories = []
    for r in rows:
        amt = Decimal(str(r.total))
        categories.append({
            "category": r.name,
            "amount": float(amt),
            "count": r.count,
            "percentage": round(float(amt / grand_total * 100), 1) if grand_total else 0,
        })

    return {
        "month": month,
        "year": year,
        "total_expense": float(grand_total),
        "categories": categories,
    }


def compare_months(
    db: Session,
    user_id: UUID,
    month1: int,
    year1: int,
    month2: int,
    year2: int,
) -> dict:
    """
    Two separate index scans on ix_transactions_user_date.
    Faster than a single query with CASE/EXTRACT grouping.
    """
    m1 = get_monthly_summary(db, user_id, month1, year1)
    m2 = get_monthly_summary(db, user_id, month2, year2)

    def _diff(a: float, b: float) -> dict:
        change = b - a
        pct = round(change / a * 100, 1) if a else 0
        return {"change": change, "percentage": pct}

    return {
        "month_1": m1,
        "month_2": m2,
        "income_diff": _diff(m1["total_income"], m2["total_income"]),
        "expense_diff": _diff(m1["total_expense"], m2["total_expense"]),
    }


def get_top_transactions(
    db: Session,
    user_id: UUID,
    month: int,
    year: int,
    top_n: int = 5,
    type: Optional[str] = None,
) -> dict:
    """
    Index: ix_transactions_user_date_amount (user_id, date range, amount DESC)
    If type filter: ix_transactions_user_type_date
    """
    q = (
        db.query(
            Transaction.amount,
            Transaction.type,
            Transaction.description,
            Transaction.transaction_date,
            Category.name.label("category_name"),
        )
        .join(Category, Transaction.category_id == Category.id)
        .filter(Transaction.user_id == user_id, *_date_filters(month, year))
    )
    if type:
        q = q.filter(Transaction.type == type)

    rows = q.order_by(desc(Transaction.amount)).limit(top_n).all()

    return {
        "month": month,
        "year": year,
        "transactions": [
            {
                "amount": float(r.amount),
                "type": r.type,
                "description": r.description or r.category_name,
                "category": r.category_name,
                "date": r.transaction_date.isoformat(),
            }
            for r in rows
        ],
    }


def get_budget_status(db: Session, user_id: UUID, month: int, year: int) -> dict:
    """
    Index: ix_budgets_user_month_year for budget lookup
    Then ix_transactions_user_category for spent aggregation per category
    """
    budgets = (
        db.query(Budget)
        .filter(Budget.user_id == user_id, Budget.month == month, Budget.year == year)
        .all()
    )

    if not budgets:
        return {"month": month, "year": year, "budgets": [], "message": "Chưa có budget nào."}

    # Batch: get all spending by category for the month in one query
    start, end = month_date_range(month, year)
    spent_rows = (
        db.query(
            Transaction.category_id,
            func.coalesce(func.sum(Transaction.amount), 0).label("spent"),
        )
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.transaction_date >= start,
            Transaction.transaction_date < end,
        )
        .group_by(Transaction.category_id)
        .all()
    )
    spent_map = {str(r.category_id): float(r.spent) for r in spent_rows}

    result = []
    for b in budgets:
        cat_name = b.category.name if b.category else "Tổng"
        limit_amt = float(b.amount)
        spent = spent_map.get(str(b.category_id), 0.0)
        remaining = limit_amt - spent
        pct = round(spent / limit_amt * 100, 1) if limit_amt else 0

        result.append({
            "category": cat_name,
            "budget_limit": limit_amt,
            "spent": spent,
            "remaining": remaining,
            "percentage": pct,
            "over_budget": pct >= 100,
        })

    return {"month": month, "year": year, "budgets": result}


def get_recent_transactions(
    db: Session, user_id: UUID, limit: int = 10, type: Optional[str] = None
) -> dict:
    """
    Index: ix_transactions_user_type_date (backward scan for ORDER BY date DESC)
    or ix_transactions_user_date if no type filter
    """
    q = (
        db.query(
            Transaction.amount,
            Transaction.type,
            Transaction.description,
            Transaction.transaction_date,
            Category.name.label("category_name"),
        )
        .join(Category, Transaction.category_id == Category.id)
        .filter(Transaction.user_id == user_id)
    )
    if type:
        q = q.filter(Transaction.type == type)

    rows = q.order_by(desc(Transaction.transaction_date)).limit(limit).all()

    return {
        "transactions": [
            {
                "amount": float(r.amount),
                "type": r.type,
                "description": r.description or r.category_name,
                "category": r.category_name,
                "date": r.transaction_date.isoformat(),
            }
            for r in rows
        ]
    }


# Registry: maps function name → callable
# Used by chat_service to dispatch OpenAI function_call.name
CHAT_FUNCTIONS = {
    "get_monthly_summary": get_monthly_summary,
    "get_spending_by_category": get_spending_by_category,
    "compare_months": compare_months,
    "get_top_transactions": get_top_transactions,
    "get_budget_status": get_budget_status,
    "get_recent_transactions": get_recent_transactions,
}
