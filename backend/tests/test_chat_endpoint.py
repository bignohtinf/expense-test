"""Endpoint-level tests for POST /api/v1/chat and /api/v1/chat/suggestions."""
from tests.fakes import FakeOpenAIClient, function_call_response, text_response


def test_chat_endpoint_requires_auth(client):
    res = client.post("/api/v1/chat", json={"message": "Tổng chi tháng này?"})
    assert res.status_code in (401, 403)


def test_chat_endpoint_returns_answer(client, auth_headers, monkeypatch):
    fake_client = FakeOpenAIClient([
        function_call_response("call_1", "get_recent_transactions", {"limit": 5}),
        text_response("Bạn chưa có giao dịch nào gần đây."),
    ])
    monkeypatch.setattr("app.services.chat_service.get_openai_client", lambda: fake_client)

    res = client.post("/api/v1/chat", json={"message": "Giao dịch gần đây của tôi?"}, headers=auth_headers)
    assert res.status_code == 200
    body = res.json()
    assert body["function_called"] == "get_recent_transactions"
    assert body["answer"]


def test_chat_suggestions_endpoint(client):
    res = client.get("/api/v1/chat/suggestions")
    assert res.status_code == 200
    assert len(res.json()["suggestions"]) == 4


def test_chat_endpoint_rate_limited_after_20_requests(client, auth_headers, monkeypatch):
    fake_client = FakeOpenAIClient([text_response("ok")] * 25)
    monkeypatch.setattr("app.services.chat_service.get_openai_client", lambda: fake_client)

    for _ in range(20):
        res = client.post("/api/v1/chat", json={"message": "hi"}, headers=auth_headers)
        assert res.status_code == 200

    blocked = client.post("/api/v1/chat", json={"message": "hi"}, headers=auth_headers)
    assert blocked.status_code == 429


def test_chat_message_too_long_rejected(client, auth_headers):
    res = client.post("/api/v1/chat", json={"message": "a" * 501}, headers=auth_headers)
    assert res.status_code == 422
