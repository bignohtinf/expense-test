"""
NLP Quick-Add transaction parsing (design doc section 13).

Turns a short natural-language Vietnamese sentence ("ăn trưa 20k") into a
structured transaction draft: amount, type, category, description, date,
and a confidence score. Nothing is written to the database here — the
caller (endpoint) only returns a draft; the frontend must POST to
`/transactions` separately to actually create it.
"""
import json
import logging
import re
from datetime import date, timedelta
from uuid import UUID

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.category import Category
from app.prompts.parse_transaction import (
    build_parse_system_prompt,
    PARSE_RESPONSE_JSON_SCHEMA,
    PARSE_FALLBACK_MESSAGE,
)
from app.utils.openai_client import get_openai_client, get_chat_model

logger = logging.getLogger(__name__)

MAX_TEXT_LENGTH = 200


class TransactionParseError(Exception):
    """Raised when the input cannot be parsed into a transaction draft."""

    def __init__(self, message: str = PARSE_FALLBACK_MESSAGE):
        super().__init__(message)
        self.message = message


def _sanitize(text: str) -> str:
    cleaned = re.sub(r"<[^>]*>", "", text.strip())
    return cleaned[:MAX_TEXT_LENGTH]


def _get_user_categories(db: Session, user_id: UUID) -> list[Category]:
    return (
        db.query(Category)
        .filter(or_(Category.user_id == user_id, Category.user_id == None))
        .order_by(Category.is_default.desc(), Category.name)
        .all()
    )


def _match_category(categories: list[Category], category_name: str, tx_type: str) -> tuple[Category | None, float]:
    """Returns (matched_category, category_score)."""
    same_type = [c for c in categories if c.type == tx_type]

    for c in same_type:
        if c.name == category_name:
            return c, 1.0

    lowered = category_name.strip().lower()
    for c in same_type:
        if c.name.lower() == lowered:
            return c, 1.0

    # Fallback: the "Khác" (Other) category for this type.
    for c in same_type:
        if c.name.lower() == "khác":
            return c, 0.5

    # Last resort: first category of this type, if any exist at all.
    if same_type:
        return same_type[0], 0.3

    return None, 0.0


def _resolve_date(date_hint: str | None) -> date:
    today = date.today()
    if not date_hint or date_hint == "today":
        return today
    if date_hint == "yesterday":
        return today - timedelta(days=1)
    try:
        return date.fromisoformat(date_hint)
    except ValueError:
        return today


def parse_transaction_text(db: Session, user_id: UUID, text: str) -> dict:
    """
    Returns a dict matching TransactionParseResponse:
    {amount, type, category_id, category_name, description, transaction_date,
     confidence, raw_text}
    Raises TransactionParseError on any failure (OpenAI error, invalid JSON,
    invalid amount, no categories available).
    """
    raw_text = text
    cleaned = _sanitize(text)
    if not cleaned:
        raise TransactionParseError()

    categories = _get_user_categories(db, user_id)
    if not categories:
        raise TransactionParseError("Chưa có danh mục nào để phân loại giao dịch.")

    category_payload = [{"name": c.name, "type": c.type} for c in categories]
    system_prompt = build_parse_system_prompt(category_payload)

    client = get_openai_client()
    model = get_chat_model()

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": cleaned},
            ],
            response_format={"type": "json_schema", "json_schema": PARSE_RESPONSE_JSON_SCHEMA},
        )
        content = response.choices[0].message.content or ""
        parsed = json.loads(content)
    except Exception:
        logger.exception("OpenAI parse call failed for transaction quick-add")
        raise TransactionParseError()

    try:
        amount = float(parsed["amount"])
        tx_type = parsed["type"]
        category_name = parsed["category_name"]
        description = parsed.get("description") or cleaned
        date_hint = parsed.get("date_hint")
        confidence_hint = float(parsed.get("confidence_hint", 0.5))
    except (KeyError, TypeError, ValueError):
        logger.warning("Malformed parse response: %s", parsed)
        raise TransactionParseError()

    if amount <= 0 or tx_type not in ("income", "expense"):
        raise TransactionParseError()

    category, category_score = _match_category(categories, category_name, tx_type)
    if category is None:
        raise TransactionParseError("Không tìm được danh mục phù hợp cho giao dịch này.")

    transaction_date = _resolve_date(date_hint)

    amount_score = 1.0 if amount > 0 else 0.0
    confidence_hint = max(0.0, min(1.0, confidence_hint))
    confidence = round(amount_score * 0.3 + category_score * 0.3 + confidence_hint * 0.4, 2)

    return {
        "amount": amount,
        "type": tx_type,
        "category_id": category.id,
        "category_name": category.name,
        "description": description,
        "transaction_date": transaction_date,
        "confidence": confidence,
        "raw_text": raw_text,
    }
