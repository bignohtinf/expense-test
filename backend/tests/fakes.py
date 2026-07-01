"""
Fake OpenAI client test doubles.

We never want tests to hit the real OpenAI API (slow, costs money, flaky,
needs a real key). These fakes reproduce just enough of the
`openai` python SDK's response shape for `chat_service.py` and
`transaction_parser.py` to work against unmodified.
"""
import json


class FakeFunction:
    def __init__(self, name: str, arguments: dict | str):
        self.name = name
        self.arguments = arguments if isinstance(arguments, str) else json.dumps(arguments)


class FakeToolCall:
    def __init__(self, call_id: str, name: str, arguments: dict | str):
        self.id = call_id
        self.function = FakeFunction(name, arguments)


class FakeMessage:
    def __init__(self, content: str | None = None, tool_calls: list[FakeToolCall] | None = None):
        self.content = content
        self.tool_calls = tool_calls or []

    def model_dump(self, exclude_unset: bool = True) -> dict:
        return {
            "role": "assistant",
            "content": self.content,
            "tool_calls": [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {"name": tc.function.name, "arguments": tc.function.arguments},
                }
                for tc in self.tool_calls
            ] or None,
        }


class FakeChoice:
    def __init__(self, message: FakeMessage):
        self.message = message


class FakeChatResponse:
    def __init__(self, message: FakeMessage):
        self.choices = [FakeChoice(message)]


class FakeChatCompletions:
    def __init__(self, responses: list[FakeChatResponse]):
        self._responses = list(responses)
        self.calls: list[dict] = []

    def create(self, **kwargs):
        self.calls.append(kwargs)
        if not self._responses:
            raise AssertionError("FakeChatCompletions: no more canned responses queued")
        return self._responses.pop(0)


class FakeChat:
    def __init__(self, responses: list[FakeChatResponse]):
        self.completions = FakeChatCompletions(responses)


class FakeOpenAIClient:
    """Drop-in replacement for `openai.OpenAI` used in tests."""

    def __init__(self, responses: list[FakeChatResponse]):
        self.chat = FakeChat(responses)


def function_call_response(call_id: str, name: str, arguments: dict) -> FakeChatResponse:
    return FakeChatResponse(FakeMessage(tool_calls=[FakeToolCall(call_id, name, arguments)]))


def text_response(content: str) -> FakeChatResponse:
    return FakeChatResponse(FakeMessage(content=content))


def json_response(payload: dict) -> FakeChatResponse:
    return FakeChatResponse(FakeMessage(content=json.dumps(payload)))
