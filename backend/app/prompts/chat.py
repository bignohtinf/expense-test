"""
System prompt + OpenAI function-calling tool definitions for the Chat
feature (design doc section 12). The model is only ever allowed to call
one of these predefined, safe, user-scoped functions — it never generates
raw SQL.
"""

CHAT_SYSTEM_PROMPT = """Bạn là trợ lý tài chính cá nhân của ứng dụng MoneyMind. \
Nhiệm vụ của bạn là trả lời câu hỏi của người dùng về dữ liệu thu chi của họ bằng tiếng Việt, \
ngắn gọn, thân thiện và chính xác dựa trên dữ liệu được cung cấp qua function calling.

Quy tắc:
- Luôn gọi một trong các function có sẵn để lấy dữ liệu trước khi trả lời — không tự bịa số liệu.
- Nếu câu hỏi không liên quan tới function nào, hoặc thiếu thông tin (ví dụ không rõ tháng/năm), \
hãy hỏi lại người dùng thay vì đoán.
- Khi không có tháng/năm được nhắc tới, mặc định dùng tháng và năm hiện tại.
- Định dạng số tiền theo kiểu Việt Nam (vd: 3.200.000₫).
- Trả lời súc tích, không quá 3-4 câu, có thể liệt kê gạch đầu dòng nếu cần so sánh nhiều mục.
"""

CHAT_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_monthly_summary",
            "description": "Lấy tổng thu nhập, chi tiêu và số dư của một tháng cụ thể.",
            "parameters": {
                "type": "object",
                "properties": {
                    "month": {"type": "integer", "minimum": 1, "maximum": 12},
                    "year": {"type": "integer"},
                },
                "required": ["month", "year"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_spending_by_category",
            "description": "Lấy breakdown chi tiêu theo danh mục trong một tháng, sắp xếp giảm dần.",
            "parameters": {
                "type": "object",
                "properties": {
                    "month": {"type": "integer", "minimum": 1, "maximum": 12},
                    "year": {"type": "integer"},
                    "top_n": {"type": "integer", "default": 10, "description": "Số danh mục muốn lấy"},
                },
                "required": ["month", "year"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "compare_months",
            "description": "So sánh tổng thu/chi giữa hai tháng.",
            "parameters": {
                "type": "object",
                "properties": {
                    "month1": {"type": "integer", "minimum": 1, "maximum": 12},
                    "year1": {"type": "integer"},
                    "month2": {"type": "integer", "minimum": 1, "maximum": 12},
                    "year2": {"type": "integer"},
                },
                "required": ["month1", "year1", "month2", "year2"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_top_transactions",
            "description": "Lấy các giao dịch có số tiền lớn nhất trong một tháng.",
            "parameters": {
                "type": "object",
                "properties": {
                    "month": {"type": "integer", "minimum": 1, "maximum": 12},
                    "year": {"type": "integer"},
                    "top_n": {"type": "integer", "default": 5},
                    "type": {"type": "string", "enum": ["income", "expense"], "description": "Lọc theo loại giao dịch (tùy chọn)"},
                },
                "required": ["month", "year"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_budget_status",
            "description": "Lấy tình trạng các budget (hạn mức) đã đặt trong một tháng: đã chi bao nhiêu, còn lại bao nhiêu.",
            "parameters": {
                "type": "object",
                "properties": {
                    "month": {"type": "integer", "minimum": 1, "maximum": 12},
                    "year": {"type": "integer"},
                },
                "required": ["month", "year"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_recent_transactions",
            "description": "Lấy N giao dịch gần đây nhất, không giới hạn theo tháng.",
            "parameters": {
                "type": "object",
                "properties": {
                    "limit": {"type": "integer", "default": 10},
                    "type": {"type": "string", "enum": ["income", "expense"], "description": "Lọc theo loại giao dịch (tùy chọn)"},
                },
                "required": [],
            },
        },
    },
]

CHAT_FALLBACK_MESSAGE = "Xin lỗi, tôi chưa hiểu câu hỏi. Bạn có thể hỏi lại không?"

# 4 gợi ý hiển thị trên ChatSuggestions ở frontend (design doc 12.6)
CHAT_SUGGESTIONS = [
    "Tổng chi tháng này?",
    "So sánh tháng trước?",
    "Chi nhiều nhất vào đâu?",
    "Budget còn bao nhiêu?",
]
