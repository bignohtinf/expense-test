def _add_transaction(client, headers, category_id, tx_type, amount, date):
    res = client.post("/api/v1/transactions", json={
        "category_id": category_id, "type": tx_type, "amount": amount, "transaction_date": date,
    }, headers=headers)
    assert res.status_code == 201


def test_report_summary(client, auth_headers):
    expense_cat = next(c for c in client.get("/api/v1/categories?type=expense", headers=auth_headers).json() if c["name"] == "Ăn uống")
    income_cat = next(c for c in client.get("/api/v1/categories?type=income", headers=auth_headers).json() if c["name"] == "Lương")

    _add_transaction(client, auth_headers, expense_cat["id"], "expense", 200000, "2026-07-02")
    _add_transaction(client, auth_headers, income_cat["id"], "income", 5000000, "2026-07-01")

    res = client.get("/api/v1/reports/summary?month=7&year=2026", headers=auth_headers)
    assert res.status_code == 200
    body = res.json()
    assert float(body["total_income"]) == 5000000
    assert float(body["total_expense"]) == 200000
    assert float(body["net"]) == 4800000
    assert body["transaction_count"] == 2


def test_report_by_category(client, auth_headers):
    expense_cat = next(c for c in client.get("/api/v1/categories?type=expense", headers=auth_headers).json() if c["name"] == "Ăn uống")
    _add_transaction(client, auth_headers, expense_cat["id"], "expense", 100000, "2026-07-03")

    res = client.get("/api/v1/reports/by-category?month=7&year=2026&type=expense", headers=auth_headers)
    assert res.status_code == 200
    body = res.json()
    assert len(body) == 1
    assert body[0]["category_name"] == "Ăn uống"
    assert body[0]["percentage"] == 100.0
