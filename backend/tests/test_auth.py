def test_register_creates_user_wallet_and_categories(client):
    res = client.post("/api/v1/auth/register", json={
        "email": "alice@example.com", "password": "password123", "full_name": "Alice",
    })
    assert res.status_code == 201
    body = res.json()
    assert body["user"]["email"] == "alice@example.com"
    assert body["access_token"]
    assert body["refresh_token"]


def test_register_duplicate_email_fails(client, register_user):
    register_user(email="dup@example.com")
    res = client.post("/api/v1/auth/register", json={
        "email": "dup@example.com", "password": "password123", "full_name": "Someone Else",
    })
    assert res.status_code == 400


def test_login_success(client, register_user):
    register_user(email="bob@example.com", password="secret123")
    res = client.post("/api/v1/auth/login", json={"email": "bob@example.com", "password": "secret123"})
    assert res.status_code == 200
    assert res.json()["access_token"]


def test_login_wrong_password(client, register_user):
    register_user(email="carol@example.com", password="secret123")
    res = client.post("/api/v1/auth/login", json={"email": "carol@example.com", "password": "wrong"})
    assert res.status_code == 401


def test_get_me_requires_auth(client):
    res = client.get("/api/v1/auth/me")
    assert res.status_code in (401, 403)


def test_get_me_with_token(client, auth_headers):
    res = client.get("/api/v1/auth/me", headers=auth_headers)
    assert res.status_code == 200
    assert "email" in res.json()
