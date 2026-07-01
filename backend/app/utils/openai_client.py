"""
OpenAI client wrapper (singleton).

Centralizes client construction so the rest of the app never imports
`openai` directly — makes it trivial to mock in tests (monkeypatch
`get_openai_client`) and to swap providers later.
"""
from functools import lru_cache
from openai import OpenAI
from app.core.config import settings


@lru_cache(maxsize=1)
def get_openai_client() -> OpenAI:
    """Return a cached OpenAI client instance built from settings."""
    return OpenAI(api_key=settings.OPENAI_API_KEY)


def get_chat_model() -> str:
    return settings.OPENAI_MODEL
