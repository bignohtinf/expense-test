def _expense_category(client, headers, name="Ăn uống"):
    cats = client.get("/api/v1/categories?type=expense", headers=headers).json()
    return next(c for c in cats if c["name"] == name)


def test_create_budget_and_track_spending(client, auth_headers):
    cat = _expense_category(client, auth_headers)

    budget = client.post("/api/v1/budgets", json={
        "category_id": cat["id"], "amount": 1000000, "month": 7, "year": 2026,
    }, headers=auth_headers)
    assert budget.status_code == 201
    assert float(budget.json()["spent"]) == 0

    client.post("/api/v1/transactions", json={
        "category_id": cat["id"], "type": "expense", "amount": 300000, "transaction_date": "2026-07-05",
    }, headers=auth_headers)

    listed = client.get("/api/v1/budgets?month=7&year=2026", headers=auth_headers).json()
    assert len(listed) == 1
    assert float(listed[0]["spent"]) == 300000
    assert float(listed[0]["remaining"]) == 700000
    assert listed[0]["percentage"] == 30.0


def test_duplicate_budget_rejected(client, auth_headers):
    cat = _expense_category(client, auth_headers)
    client.post("/api/v1/budgets", json={
        "category_id": cat["id"], "amount": 500000, "month": 8, "year": 2026,
    }, headers=auth_headers)
    dup = client.post("/api/v1/budgets", json={
        "category_id": cat["id"], "amount": 500000, "month": 8, "year": 2026,
    }, headers=auth_headers)
    assert dup.status_code == 400


def test_delete_budget(client, auth_headers):
    cat = _expense_category(client, auth_headers)
    created = client.post("/api/v1/budgets", json={
        "category_id": cat["id"], "amount": 500000, "month": 9, "year": 2026,
    }, headers=auth_headers).json()

    res = client.delete(f"/api/v1/budgets/{created['id']}", headers=auth_headers)
    assert res.status_code == 200
    assert client.get("/api/v1/budgets?month=9&year=2026", headers=auth_headers).json() == []
