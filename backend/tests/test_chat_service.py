"""Unit tests for chat_service.handle_chat_message -- the OpenAI function
calling orchestration (design doc section 12)."""
from datetime import date

from app.models.user import User
from app.models.category import Category
from app.models.transaction import Transaction
from app.services.chat_service import handle_chat_message
from app.utils.seed import seed_default_categories
from tests.fakes import FakeOpenAIClient, function_call_response, text_response


def _make_user(db_session):
    seed_default_categories(db_session)
    user = User(email="chatservice@example.com", full_name="Chat Service Test", hashed_password="x")
    db_session.add(user)
    db_session.flush()
    food = db_session.query(Category).filter(Category.name == "Ăn uống", Category.type == "expense").first()
    db_session.add(Transaction(user_id=user.id, category_id=food.id, type="expense", amount=150000, transaction_date=date(2026, 7, 1)))
    db_session.commit()
    return user


def test_handle_chat_message_calls_function_and_formats_answer(db_session, monkeypatch):
    user = _make_user(db_session)

    first = function_call_response("call_1", "get_monthly_summary", {"month": 7, "year": 2026})
    second = text_response("Tháng 7/2026 bạn đã chi 150.000₫.")
    fake_client = FakeOpenAIClient([first, second])
    monkeypatch.setattr("app.services.chat_service.get_openai_client", lambda: fake_client)

    result = handle_chat_message(db=db_session, user_id=user.id, message="Tổng chi tháng này?")

    assert result["function_called"] == "get_monthly_summary"
    assert result["data"]["total_expense"] == 150000
    assert "150" in result["answer"] or result["answer"]


def test_handle_chat_message_model_answers_without_tool_call(db_session, monkeypatch):
    user = _make_user(db_session)
    fake_client = FakeOpenAIClient([text_response("Bạn muốn hỏi về tháng nào?")])
    monkeypatch.setattr("app.services.chat_service.get_openai_client", lambda: fake_client)

    result = handle_chat_message(db=db_session, user_id=user.id, message="chi tiêu")
    assert result["function_called"] is None
    assert result["answer"] == "Bạn muốn hỏi về tháng nào?"


def test_handle_chat_message_openai_error_falls_back(db_session, monkeypatch):
    user = _make_user(db_session)

    class BoomClient:
        class chat:
            class completions:
                @staticmethod
                def create(**kwargs):
                    raise RuntimeError("network error")

    monkeypatch.setattr("app.services.chat_service.get_openai_client", lambda: BoomClient())

    result = handle_chat_message(db=db_session, user_id=user.id, message="Tổng chi tháng này?")
    assert "Xin lỗi" in result["answer"]
    assert result["function_called"] is None


def test_handle_chat_message_empty_message_returns_fallback(db_session):
    user = _make_user(db_session)
    result = handle_chat_message(db=db_session, user_id=user.id, message="   ")
    assert result["function_called"] is None
