def test_list_categories_includes_seeded_defaults(client, auth_headers):
    res = client.get("/api/v1/categories", headers=auth_headers)
    assert res.status_code == 200
    names = [c["name"] for c in res.json()]
    assert "Ăn uống" in names
    assert "Lương" in names


def test_list_categories_filtered_by_type(client, auth_headers):
    res = client.get("/api/v1/categories?type=income", headers=auth_headers)
    assert res.status_code == 200
    assert all(c["type"] == "income" for c in res.json())


def test_create_custom_category(client, auth_headers):
    res = client.post("/api/v1/categories", json={
        "name": "Du lịch", "type": "expense", "icon": "plane", "color": "#3b82f6",
    }, headers=auth_headers)
    assert res.status_code == 201
    assert res.json()["name"] == "Du lịch"


def test_delete_default_category_forbidden(client, auth_headers):
    categories = client.get("/api/v1/categories?type=expense", headers=auth_headers).json()
    default_cat = next(c for c in categories if c["is_default"])
    res = client.delete(f"/api/v1/categories/{default_cat['id']}", headers=auth_headers)
    assert res.status_code == 404
