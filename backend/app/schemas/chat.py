from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=500)


class ChatResponse(BaseModel):
    answer: str
    function_called: str | None = None
    data: dict | None = None


class ChatSuggestionsResponse(BaseModel):
    suggestions: list[str]
