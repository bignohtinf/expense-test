"""Unit tests for the NLP Quick-Add parser service (design doc section 13)."""
import pytest
from datetime import date, timedelta

from app.models.user import User
from app.services.transaction_parser import parse_transaction_text, TransactionParseError
from app.utils.seed import seed_default_categories
from tests.fakes import FakeOpenAIClient, json_response, text_response


def _make_user(db_session):
    seed_default_categories(db_session)
    user = User(email="parser@example.com", full_name="Parser Test", hashed_password="x")
    db_session.add(user)
    db_session.commit()
    return user


def test_parse_exact_category_match_high_confidence(db_session, monkeypatch):
    user = _make_user(db_session)
    fake = FakeOpenAIClient([json_response({
        "amount": 20000, "type": "expense", "category_name": "Ăn uống",
        "description": "Ăn trưa", "date_hint": "today", "confidence_hint": 1.0,
    })])
    monkeypatch.setattr("app.services.transaction_parser.get_openai_client", lambda: fake)

    draft = parse_transaction_text(db_session, user.id, "ăn trưa 20k")
    assert draft["amount"] == 20000
    assert draft["category_name"] == "Ăn uống"
    assert draft["confidence"] >= 0.9
    assert draft["transaction_date"] == date.today()


def test_parse_yesterday_date_hint(db_session, monkeypatch):
    user = _make_user(db_session)
    fake = FakeOpenAIClient([json_response({
        "amount": 35000, "type": "expense", "category_name": "Ăn uống",
        "description": "Cà phê", "date_hint": "yesterday", "confidence_hint": 0.9,
    })])
    monkeypatch.setattr("app.services.transaction_parser.get_openai_client", lambda: fake)

    draft = parse_transaction_text(db_session, user.id, "cà phê 35k hôm qua")
    assert draft["transaction_date"] == date.today() - timedelta(days=1)


def test_parse_explicit_iso_date_hint(db_session, monkeypatch):
    user = _make_user(db_session)
    fake = FakeOpenAIClient([json_response({
        "amount": 500000, "type": "expense", "category_name": "Hóa đơn",
        "description": "Tiền điện", "date_hint": "2026-06-15", "confidence_hint": 0.85,
    })])
    monkeypatch.setattr("app.services.transaction_parser.get_openai_client", lambda: fake)

    draft = parse_transaction_text(db_session, user.id, "tiền điện tháng 6 500k ngày 15/6")
    assert draft["transaction_date"] == date(2026, 6, 15)


def test_parse_unknown_category_falls_back_to_khac_and_lowers_confidence(db_session, monkeypatch):
    user = _make_user(db_session)
    fake = FakeOpenAIClient([json_response({
        "amount": 100000, "type": "expense", "category_name": "Không tồn tại",
        "description": "Gì đó", "date_hint": None, "confidence_hint": 0.9,
    })])
    monkeypatch.setattr("app.services.transaction_parser.get_openai_client", lambda: fake)

    draft = parse_transaction_text(db_session, user.id, "mua gì đó 100k")
    assert draft["category_name"] == "Khác"
    # category_score fallback (0.5) pulls confidence below the exact-match case
    assert draft["confidence"] < 1.0


def test_parse_zero_amount_raises(db_session, monkeypatch):
    user = _make_user(db_session)
    fake = FakeOpenAIClient([json_response({
        "amount": 0, "type": "expense", "category_name": "Ăn uống",
        "description": "?", "date_hint": "today", "confidence_hint": 0.5,
    })])
    monkeypatch.setattr("app.services.transaction_parser.get_openai_client", lambda: fake)

    with pytest.raises(TransactionParseError):
        parse_transaction_text(db_session, user.id, "???")


def test_parse_invalid_json_raises(db_session, monkeypatch):
    user = _make_user(db_session)
    fake = FakeOpenAIClient([text_response("this is not json")])
    monkeypatch.setattr("app.services.transaction_parser.get_openai_client", lambda: fake)

    with pytest.raises(TransactionParseError):
        parse_transaction_text(db_session, user.id, "abc")


def test_parse_empty_text_raises(db_session):
    user = _make_user(db_session)
    with pytest.raises(TransactionParseError):
        parse_transaction_text(db_session, user.id, "   ")
