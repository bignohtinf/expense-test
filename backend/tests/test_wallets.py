def test_register_creates_default_cash_wallet(client, auth_headers):
    res = client.get("/api/v1/wallets", headers=auth_headers)
    assert res.status_code == 200
    wallets = res.json()
    assert len(wallets) == 1
    assert wallets[0]["name"] == "Tiền mặt"


def test_create_wallet(client, auth_headers):
    res = client.post("/api/v1/wallets", json={
        "name": "Ngân hàng ABC", "balance": 1000000, "type": "bank",
    }, headers=auth_headers)
    assert res.status_code == 201
    assert res.json()["name"] == "Ngân hàng ABC"


def test_update_wallet(client, auth_headers):
    created = client.post("/api/v1/wallets", json={"name": "Ví X", "type": "cash"}, headers=auth_headers).json()
    res = client.put(f"/api/v1/wallets/{created['id']}", json={"name": "Ví Y"}, headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["name"] == "Ví Y"


def test_delete_wallet_soft_deletes(client, auth_headers):
    created = client.post("/api/v1/wallets", json={"name": "Ví Z", "type": "cash"}, headers=auth_headers).json()
    res = client.delete(f"/api/v1/wallets/{created['id']}", headers=auth_headers)
    assert res.status_code == 200

    wallets = client.get("/api/v1/wallets", headers=auth_headers).json()
    assert all(w["id"] != created["id"] for w in wallets)
