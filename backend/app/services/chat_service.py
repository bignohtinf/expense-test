"""
Chat feature orchestration (design doc section 12).

Pipeline: user message -> OpenAI function calling picks a predefined safe
function -> Function Router executes it against Postgres (always scoped to
current_user.id) -> OpenAI formats the result into a Vietnamese answer.
"""
import json
import logging
from uuid import UUID

from sqlalchemy.orm import Session

from app.prompts.chat import CHAT_SYSTEM_PROMPT, CHAT_TOOLS, CHAT_FALLBACK_MESSAGE
from app.services.chat_queries import CHAT_FUNCTIONS
from app.utils.openai_client import get_openai_client, get_chat_model

logger = logging.getLogger(__name__)

MAX_MESSAGE_LENGTH = 500


class ChatServiceError(Exception):
    """Raised when the chat pipeline cannot produce an answer."""


def _sanitize(message: str) -> str:
    text = message.strip()
    # Strip HTML tags defensively — the frontend also sanitizes on render.
    import re
    text = re.sub(r"<[^>]*>", "", text)
    return text[:MAX_MESSAGE_LENGTH]


def _dispatch_function_call(db: Session, user_id: UUID, name: str, arguments: dict) -> dict:
    func = CHAT_FUNCTIONS.get(name)
    if func is None:
        raise ChatServiceError(f"Unknown function: {name}")
    return func(db=db, user_id=user_id, **arguments)


def handle_chat_message(db: Session, user_id: UUID, message: str) -> dict:
    """
    Returns: {"answer": str, "function_called": str | None, "data": dict | None}
    Never raises for OpenAI/model errors — falls back to a friendly message instead,
    per design doc 12.5 ("OpenAI error fallback").
    """
    text = _sanitize(message)
    if not text:
        return {"answer": CHAT_FALLBACK_MESSAGE, "function_called": None, "data": None}

    client = get_openai_client()
    model = get_chat_model()

    messages = [
        {"role": "system", "content": CHAT_SYSTEM_PROMPT},
        {"role": "user", "content": text},
    ]

    try:
        first_response = client.chat.completions.create(
            model=model,
            messages=messages,
            tools=CHAT_TOOLS,
            tool_choice="auto",
        )
    except Exception:
        logger.exception("OpenAI call failed in chat_service (first pass)")
        return {"answer": CHAT_FALLBACK_MESSAGE, "function_called": None, "data": None}

    choice = first_response.choices[0]
    tool_calls = choice.message.tool_calls or []

    if not tool_calls:
        # Model answered directly without needing data (e.g. clarifying question).
        content = (choice.message.content or "").strip()
        return {"answer": content or CHAT_FALLBACK_MESSAGE, "function_called": None, "data": None}

    tool_call = tool_calls[0]
    function_name = tool_call.function.name

    try:
        arguments = json.loads(tool_call.function.arguments or "{}")
    except json.JSONDecodeError:
        logger.warning("Could not parse function call arguments: %s", tool_call.function.arguments)
        return {"answer": CHAT_FALLBACK_MESSAGE, "function_called": None, "data": None}

    try:
        data = _dispatch_function_call(db, user_id, function_name, arguments)
    except Exception:
        logger.exception("Function dispatch failed for %s(%s)", function_name, arguments)
        return {"answer": CHAT_FALLBACK_MESSAGE, "function_called": function_name, "data": None}

    # Second pass: ask OpenAI to turn the raw data into a Vietnamese answer.
    messages.append(choice.message.model_dump(exclude_unset=True))
    messages.append({
        "role": "tool",
        "tool_call_id": tool_call.id,
        "content": json.dumps(data, ensure_ascii=False),
    })

    try:
        second_response = client.chat.completions.create(
            model=model,
            messages=messages,
        )
        answer = (second_response.choices[0].message.content or "").strip()
    except Exception:
        logger.exception("OpenAI call failed in chat_service (second pass)")
        answer = ""

    return {
        "answer": answer or CHAT_FALLBACK_MESSAGE,
        "function_called": function_name,
        "data": data,
    }
