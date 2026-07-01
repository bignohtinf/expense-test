import os

# Must be set before any `app.*` module is imported, since app.core.config
# reads them at import time.
os.environ.setdefault("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/money_manager_test")
os.environ.setdefault("SECRET_KEY", "test-secret-key")
os.environ.setdefault("OPENAI_API_KEY", "sk-test-not-a-real-key")

import pytest
from sqlalchemy import event
from fastapi.testclient import TestClient

from app.core.database import Base, engine, SessionLocal, get_db
from app.main import app
from app.api.middleware.rate_limiting import ai_rate_limiter
# NOTE: importing all models is needed to register them on Base.metadata, but
# `import app.models` would rebind the name `app` in this module to the
# package (shadowing the FastAPI instance imported above) -- alias it instead.
import app.models as _all_models  # noqa: F401


@pytest.fixture(scope="session", autouse=True)
def _setup_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db_session():
    """
    One test = one rolled-back transaction, isolated even though application
    code (endpoints) calls `db.commit()`. Uses the standard SQLAlchemy
    "join a SAVEPOINT" test recipe: the session runs inside a nested
    transaction (SAVEPOINT); app-level commits only end the SAVEPOINT, which
    we immediately restart, while the outer connection-level transaction is
    rolled back at teardown, undoing everything.
    """
    connection = engine.connect()
    outer_transaction = connection.begin()
    session = SessionLocal(bind=connection)
    session.begin_nested()

    @event.listens_for(session, "after_transaction_end")
    def _restart_savepoint(sess, trans):
        if trans.nested and not trans._parent.nested:
            sess.begin_nested()

    yield session

    session.close()
    outer_transaction.rollback()
    connection.close()


@pytest.fixture(autouse=True)
def _reset_rate_limiter():
    ai_rate_limiter.reset()
    yield
    ai_rate_limiter.reset()


@pytest.fixture()
def client(db_session):
    def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def register_user(client):
    """Registers a fresh user and returns (headers, user_json)."""
    def _register(email: str = "user@example.com", password: str = "password123", full_name: str = "Test User"):
        res = client.post("/api/v1/auth/register", json={
            "email": email, "password": password, "full_name": full_name,
        })
        assert res.status_code == 201, res.text
        body = res.json()
        headers = {"Authorization": f"Bearer {body['access_token']}"}
        return headers, body["user"]

    return _register


@pytest.fixture()
def auth_headers(register_user):
    headers, _ = register_user()
    return headers
