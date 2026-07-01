import json
import pytest
from tests.fakes import FakeOpenAIClient, json_response


def _expense_category(client, headers):
    cats = client.get("/api/v1/categories?type=expense", headers=headers).json()
    return next(c for c in cats if c["name"] == "Ăn uống")


def test_create_and_list_transaction(client, auth_headers):
    cat = _expense_category(client, auth_headers)
    res = client.post("/api/v1/transactions", json={
        "category_id": cat["id"], "type": "expense", "amount": 50000,
        "description": "Ăn phở", "transaction_date": "2026-07-01",
    }, headers=auth_headers)
    assert res.status_code == 201
    body = res.json()
    assert body["amount"] == "50000" or float(body["amount"]) == 50000
    assert body["category"]["name"] == "Ăn uống"

    listed = client.get("/api/v1/transactions", headers=auth_headers).json()
    assert listed["total"] == 1


def test_create_transaction_wrong_category_type_fails(client, auth_headers):
    cats = client.get("/api/v1/categories?type=income", headers=auth_headers).json()
    income_cat = cats[0]
    res = client.post("/api/v1/transactions", json={
        "category_id": income_cat["id"], "type": "expense", "amount": 1000,
    }, headers=auth_headers)
    assert res.status_code == 400


def test_update_and_delete_transaction(client, auth_headers):
    cat = _expense_category(client, auth_headers)
    created = client.post("/api/v1/transactions", json={
        "category_id": cat["id"], "type": "expense", "amount": 20000,
    }, headers=auth_headers).json()

    updated = client.put(f"/api/v1/transactions/{created['id']}", json={"amount": 25000}, headers=auth_headers)
    assert updated.status_code == 200
    assert float(updated.json()["amount"]) == 25000

    deleted = client.delete(f"/api/v1/transactions/{created['id']}", headers=auth_headers)
    assert deleted.status_code == 200

    listed = client.get("/api/v1/transactions", headers=auth_headers).json()
    assert listed["total"] == 0


def test_transaction_wallet_balance_updates(client, auth_headers):
    wallets = client.get("/api/v1/wallets", headers=auth_headers).json()
    wallet = wallets[0]
    cat = _expense_category(client, auth_headers)

    client.post("/api/v1/transactions", json={
        "category_id": cat["id"], "type": "expense", "amount": 30000, "wallet_id": wallet["id"],
    }, headers=auth_headers)

    updated_wallet = client.get("/api/v1/wallets", headers=auth_headers).json()[0]
    assert float(updated_wallet["balance"]) == -30000


# --- NLP Quick-Add (/transactions/parse) ---

def test_parse_transaction_returns_draft(client, auth_headers, monkeypatch):
    fake = FakeOpenAIClient([json_response({
        "amount": 20000,
        "type": "expense",
        "category_name": "Ăn uống",
        "description": "Ăn trưa",
        "date_hint": "today",
        "confidence_hint": 0.9,
    })])
    monkeypatch.setattr("app.services.transaction_parser.get_openai_client", lambda: fake)

    res = client.post("/api/v1/transactions/parse", json={"text": "ăn trưa 20k"}, headers=auth_headers)
    assert res.status_code == 200
    body = res.json()
    assert float(body["amount"]) == 20000
    assert body["type"] == "expense"
    assert body["category_name"] == "Ăn uống"
    assert body["confidence"] > 0
    # Nothing should have been created yet.
    listed = client.get("/api/v1/transactions", headers=auth_headers).json()
    assert listed["total"] == 0


def test_parse_then_confirm_creates_transaction(client, auth_headers, monkeypatch):
    fake = FakeOpenAIClient([json_response({
        "amount": 35000,
        "type": "expense",
        "category_name": "Ăn uống",
        "description": "Cà phê",
        "date_hint": "today",
        "confidence_hint": 0.95,
    })])
    monkeypatch.setattr("app.services.transaction_parser.get_openai_client", lambda: fake)

    draft = client.post("/api/v1/transactions/parse", json={"text": "cà phê 35k"}, headers=auth_headers).json()

    created = client.post("/api/v1/transactions", json={
        "category_id": draft["category_id"],
        "type": draft["type"],
        "amount": draft["amount"],
        "description": draft["description"],
        "transaction_date": draft["transaction_date"],
    }, headers=auth_headers)
    assert created.status_code == 201

    listed = client.get("/api/v1/transactions", headers=auth_headers).json()
    assert listed["total"] == 1


def test_parse_transaction_unknown_category_falls_back(client, auth_headers, monkeypatch):
    fake = FakeOpenAIClient([json_response({
        "amount": 100000,
        "type": "expense",
        "category_name": "Danh mục không tồn tại",
        "description": "Something",
        "date_hint": None,
        "confidence_hint": 0.7,
    })])
    monkeypatch.setattr("app.services.transaction_parser.get_openai_client", lambda: fake)

    res = client.post("/api/v1/transactions/parse", json={"text": "mua đồ 100k"}, headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["category_name"] == "Khác"
    assert res.json()["confidence"] < 1.0


def test_parse_transaction_invalid_json_returns_422(client, auth_headers, monkeypatch):
    from tests.fakes import text_response
    fake = FakeOpenAIClient([text_response("not valid json")])
    monkeypatch.setattr("app.services.transaction_parser.get_openai_client", lambda: fake)

    res = client.post("/api/v1/transactions/parse", json={"text": "abc"}, headers=auth_headers)
    assert res.status_code == 422


def test_parse_transaction_requires_auth(client):
    res = client.post("/api/v1/transactions/parse", json={"text": "ăn trưa 20k"})
    assert res.status_code in (401, 403)
