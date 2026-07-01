"""Direct tests of the predefined query functions used by the Chat feature
(no OpenAI involved) -- design doc section 12.4."""
from datetime import date

from app.models.user import User
from app.models.category import Category
from app.models.transaction import Transaction
from app.services import chat_queries
from app.utils.seed import seed_default_categories


def _make_user_with_data(db_session):
    seed_default_categories(db_session)  # idempotent, ensures categories exist regardless of test order

    user = User(email="chatqueries@example.com", full_name="Chat Test", hashed_password="x")
    db_session.add(user)
    db_session.flush()

    food = db_session.query(Category).filter(Category.name == "Ăn uống", Category.type == "expense").first()
    salary = db_session.query(Category).filter(Category.name == "Lương", Category.type == "income").first()

    db_session.add_all([
        Transaction(user_id=user.id, category_id=food.id, type="expense", amount=200000, transaction_date=date(2026, 7, 1)),
        Transaction(user_id=user.id, category_id=food.id, type="expense", amount=100000, transaction_date=date(2026, 7, 5)),
        Transaction(user_id=user.id, category_id=salary.id, type="income", amount=10000000, transaction_date=date(2026, 7, 1)),
    ])
    db_session.commit()
    return user, food, salary


def test_get_monthly_summary(db_session):
    user, food, salary = _make_user_with_data(db_session)

    result = chat_queries.get_monthly_summary(db_session, user.id, 7, 2026)
    assert result["total_income"] == 10000000
    assert result["total_expense"] == 300000
    assert result["net"] == 10000000 - 300000
    assert result["transaction_count"] == 3


def test_get_spending_by_category(db_session):
    user, food, salary = _make_user_with_data(db_session)
    result = chat_queries.get_spending_by_category(db_session, user.id, 7, 2026)
    assert result["total_expense"] == 300000
    assert result["categories"][0]["category"] == "Ăn uống"
    assert result["categories"][0]["percentage"] == 100.0


def test_compare_months(db_session):
    user, food, salary = _make_user_with_data(db_session)
    result = chat_queries.compare_months(db_session, user.id, 6, 2026, 7, 2026)
    assert result["month_1"]["total_expense"] == 0
    assert result["month_2"]["total_expense"] == 300000
    assert result["expense_diff"]["change"] == 300000


def test_get_top_transactions(db_session):
    user, food, salary = _make_user_with_data(db_session)
    result = chat_queries.get_top_transactions(db_session, user.id, 7, 2026, top_n=1, type="expense")
    assert len(result["transactions"]) == 1
    assert result["transactions"][0]["amount"] == 200000


def test_get_recent_transactions(db_session):
    user, food, salary = _make_user_with_data(db_session)
    result = chat_queries.get_recent_transactions(db_session, user.id, limit=10)
    assert len(result["transactions"]) == 3


def test_get_budget_status_no_budgets(db_session):
    user, food, salary = _make_user_with_data(db_session)
    result = chat_queries.get_budget_status(db_session, user.id, 7, 2026)
    assert result["budgets"] == []
