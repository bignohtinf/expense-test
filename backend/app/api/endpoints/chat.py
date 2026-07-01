from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse, ChatSuggestionsResponse
from app.api.dependencies import rate_limit_ai
from app.services.chat_service import handle_chat_message
from app.prompts.chat import CHAT_SUGGESTIONS

router = APIRouter()


@router.post("", response_model=ChatResponse)
def chat(
    data: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(rate_limit_ai),
):
    """
    AI Query — ask about your financial data in natural Vietnamese.
    Uses OpenAI function calling to route the question to a predefined,
    user-scoped, safe query (design doc section 12). Rate limited to
    20 requests/minute/user.
    """
    result = handle_chat_message(db=db, user_id=current_user.id, message=data.message)
    return ChatResponse(**result)


@router.get("/suggestions", response_model=ChatSuggestionsResponse)
def get_chat_suggestions():
    """Quick suggestion chips shown in the ChatWidget (design doc 12.6)."""
    return ChatSuggestionsResponse(suggestions=CHAT_SUGGESTIONS)
