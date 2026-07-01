"""
System prompt + structured-output JSON schema for the NLP Quick-Add
transaction feature (design doc section 13).

The model never picks a database id and never computes real dates itself —
it only returns a category *name* (matched against the user's real
categories server-side) and a coarse `date_hint` (resolved to a real date
by the backend, to avoid timezone drift). This keeps the model's output
easy to validate and impossible to use for anything beyond drafting a
transaction.
"""

PARSE_SYSTEM_PROMPT_TEMPLATE = """Bạn là bộ máy trích xuất thông tin giao dịch tài chính từ câu tiếng Việt tự nhiên.

Người dùng sẽ nhập một câu ngắn mô tả MỘT giao dịch thu hoặc chi, ví dụ:
- "ăn trưa 20k" → chi tiêu 20.000đ, danh mục Ăn uống
- "cà phê 35k sáng nay" → chi tiêu 35.000đ, danh mục Ăn uống, hôm nay
- "lương tháng 6 là 20tr" → thu nhập 20.000.000đ, danh mục Lương

Quy tắc parse số tiền:
- "k" hoặc "nghìn" = x1.000 (vd 20k = 20000)
- "tr" hoặc "triệu" = x1.000.000 (vd 20tr = 20000000)
- Nếu không có đơn vị và số < 1000, coi như đơn vị nghìn (vd "ăn phở 50" -> 50000) chỉ khi ngữ cảnh rõ ràng là tiền; nếu mơ hồ, giữ nguyên số và hạ confidence_hint.

Danh sách danh mục hiện có của người dùng (chỉ được chọn category_name trong danh sách này):
{categories_list}

Nếu không có danh mục nào khớp rõ ràng, trả về category_name = "Khác".

Trả về DUY NHẤT một object JSON đúng schema, không thêm giải thích:
- amount: số tiền (number, đơn vị VND, > 0)
- type: "income" hoặc "expense"
- category_name: tên danh mục, phải khớp với một tên trong danh sách trên
- description: mô tả ngắn gọn lại giao dịch (vd "Ăn trưa", "Cà phê")
- date_hint: "today" nếu không nhắc ngày cụ thể, "yesterday" nếu nói "hôm qua", hoặc ngày dạng YYYY-MM-DD nếu có ngày/tháng cụ thể được nhắc tới, hoặc null nếu không xác định được
- confidence_hint: số từ 0 đến 1, tự đánh giá mức độ chắc chắn của bạn về kết quả parse này
"""

PARSE_RESPONSE_JSON_SCHEMA = {
    "name": "transaction_draft",
    "strict": True,
    "schema": {
        "type": "object",
        "properties": {
            "amount": {"type": "number"},
            "type": {"type": "string", "enum": ["income", "expense"]},
            "category_name": {"type": "string"},
            "description": {"type": "string"},
            "date_hint": {"type": ["string", "null"]},
            "confidence_hint": {"type": "number"},
        },
        "required": ["amount", "type", "category_name", "description", "date_hint", "confidence_hint"],
        "additionalProperties": False,
    },
}


def build_parse_system_prompt(categories: list[dict]) -> str:
    lines = [f"- {c['name']} ({'thu nhập' if c['type'] == 'income' else 'chi tiêu'})" for c in categories]
    return PARSE_SYSTEM_PROMPT_TEMPLATE.format(categories_list="\n".join(lines))


PARSE_FALLBACK_MESSAGE = "Không hiểu được câu này, vui lòng nhập thủ công."
