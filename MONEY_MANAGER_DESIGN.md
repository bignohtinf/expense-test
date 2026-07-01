# Money Manager — Project Design Document

## 1. Tổng quan

**Money Manager** là ứng dụng quản lý chi tiêu cá nhân cho phép người dùng theo dõi thu nhập, chi tiêu và quản lý ngân sách hàng tháng.

### Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts, React Query, Zustand |
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2 |
| Database | PostgreSQL 16 |
| Auth | JWT (python-jose) + bcrypt |
| Deploy | Frontend → Vercel, Backend → GCP Cloud Run (Docker), DB → GCP Cloud SQL |
| CI/CD | GitHub Actions |
| Testing | Backend: Pytest + httpx, Frontend: Vitest + React Testing Library |

---

## 2. Cấu trúc thư mục

```
money-manager/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI app entry
│   │   ├── config.py               # Settings (pydantic-settings)
│   │   ├── database.py             # SQLAlchemy engine + session
│   │   ├── models/                 # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── wallet.py
│   │   │   ├── category.py
│   │   │   ├── transaction.py
│   │   │   └── budget.py
│   │   ├── schemas/                # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── wallet.py
│   │   │   ├── category.py
│   │   │   ├── transaction.py
│   │   │   └── budget.py
│   │   ├── api/                    # Route handlers
│   │   │   ├── __init__.py
│   │   │   ├── deps.py             # Dependencies (get_db, get_current_user)
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── wallets.py
│   │   │   ├── categories.py
│   │   │   ├── transactions.py
│   │   │   ├── budgets.py
│   │   │   └── reports.py
│   │   ├── services/               # Business logic
│   │   │   ├── auth_service.py
│   │   │   ├── transaction_service.py
│   │   │   ├── budget_service.py
│   │   │   └── report_service.py
│   │   └── utils/
│   │       ├── security.py         # JWT + password hashing
│   │       └── seed.py             # Default categories seeder
│   ├── alembic/                    # DB migrations
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_transactions.py
│   │   └── test_budgets.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── alembic.ini
│
├── frontend/
│   ├── src/
│   │   ├── app/                    # Next.js App Router
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx            # Landing / redirect
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   └── (dashboard)/
│   │   │       ├── layout.tsx      # Sidebar + Header
│   │   │       ├── page.tsx        # Dashboard overview
│   │   │       ├── transactions/page.tsx
│   │   │       ├── budgets/page.tsx
│   │   │       ├── wallets/page.tsx
│   │   │       ├── reports/page.tsx
│   │   │       └── settings/page.tsx
│   │   ├── components/
│   │   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── MobileNav.tsx
│   │   │   ├── transactions/
│   │   │   │   ├── TransactionList.tsx
│   │   │   │   ├── TransactionForm.tsx
│   │   │   │   └── TransactionFilters.tsx
│   │   │   ├── budgets/
│   │   │   │   ├── BudgetCard.tsx
│   │   │   │   └── BudgetForm.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── BalanceCard.tsx
│   │   │   │   ├── RecentTransactions.tsx
│   │   │   │   ├── SpendingChart.tsx
│   │   │   │   └── BudgetOverview.tsx
│   │   │   └── charts/
│   │   │       ├── PieChart.tsx
│   │   │       ├── BarChart.tsx
│   │   │       └── LineChart.tsx
│   │   ├── lib/
│   │   │   ├── api.ts              # Axios instance + interceptors
│   │   │   ├── auth.ts             # Token management
│   │   │   └── utils.ts            # Format currency, dates
│   │   ├── hooks/
│   │   │   ├── useTransactions.ts
│   │   │   ├── useBudgets.ts
│   │   │   ├── useWallets.ts
│   │   │   └── useAuth.ts
│   │   ├── store/
│   │   │   └── authStore.ts        # Zustand store
│   │   └── types/
│   │       └── index.ts            # TypeScript interfaces
│   ├── public/
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── .github/
│   └── workflows/
│       ├── backend.yml
│       └── frontend.yml
├── docker-compose.yml              # Local dev
└── README.md
```

---

## 3. Database Schema

### 3.1 Tables

#### `users`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default uuid4 |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| full_name | VARCHAR(100) | NOT NULL |
| hashed_password | VARCHAR(255) | NOT NULL |
| currency | VARCHAR(3) | DEFAULT 'VND' |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | DEFAULT now() |
| updated_at | TIMESTAMP | ON UPDATE now() |

#### `wallets`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users, NOT NULL |
| name | VARCHAR(100) | NOT NULL |
| balance | DECIMAL(15,2) | DEFAULT 0 |
| type | VARCHAR(20) | ENUM('cash','bank','e_wallet','credit_card') |
| icon | VARCHAR(50) | |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | |

#### `categories`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users (NULL = system default) |
| name | VARCHAR(100) | NOT NULL |
| type | VARCHAR(10) | 'income' or 'expense' |
| icon | VARCHAR(50) | |
| color | VARCHAR(7) | Hex color |
| is_default | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMP | |

**Default categories (seeded):**
- Expense: Ăn uống, Di chuyển, Mua sắm, Giải trí, Hóa đơn, Sức khỏe, Giáo dục, Khác
- Income: Lương, Thưởng, Đầu tư, Freelance, Khác

#### `transactions`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users, NOT NULL |
| category_id | UUID | FK → categories, NOT NULL |
| wallet_id | UUID | FK → wallets |
| type | VARCHAR(10) | 'income' or 'expense' |
| amount | DECIMAL(15,2) | NOT NULL, > 0 |
| description | TEXT | |
| transaction_date | DATE | NOT NULL |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Indexes:**
- `(user_id, transaction_date DESC)` — phân trang theo ngày
- `(user_id, category_id, transaction_date)` — lọc theo category

#### `budgets`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users, NOT NULL |
| category_id | UUID | FK → categories (NULL = budget tổng) |
| amount | DECIMAL(15,2) | NOT NULL |
| month | INTEGER | 1-12 |
| year | INTEGER | |
| created_at | TIMESTAMP | |

**Constraints:**
- UNIQUE(user_id, category_id, month, year) — mỗi category chỉ 1 budget/tháng
- `spent` được tính qua query aggregate, không lưu trực tiếp

---

## 4. API Design

Base URL: `https://api.money-manager.example.com/api/v1`

### 4.1 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Đăng ký tài khoản |
| POST | `/auth/login` | Đăng nhập, trả JWT |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/me` | Lấy thông tin user hiện tại |

**Request/Response mẫu:**

```
POST /auth/register
Body: { "email": "user@example.com", "full_name": "Nguyen Van A", "password": "securePass123" }
Response 201: { "id": "uuid", "email": "...", "full_name": "...", "access_token": "jwt...", "token_type": "bearer" }
```

```
POST /auth/login
Body: { "email": "user@example.com", "password": "securePass123" }
Response 200: { "access_token": "jwt...", "refresh_token": "jwt...", "token_type": "bearer" }
```

### 4.2 Wallets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/wallets` | Danh sách ví |
| POST | `/wallets` | Tạo ví mới |
| PUT | `/wallets/{id}` | Cập nhật ví |
| DELETE | `/wallets/{id}` | Xóa ví (soft delete) |

### 4.3 Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | Danh sách (kèm filter `?type=expense`) |
| POST | `/categories` | Tạo category tùy chỉnh |
| PUT | `/categories/{id}` | Cập nhật |
| DELETE | `/categories/{id}` | Xóa (chỉ custom, không xóa default) |

### 4.4 Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/transactions` | Danh sách với pagination + filters |
| POST | `/transactions` | Tạo giao dịch mới |
| GET | `/transactions/{id}` | Chi tiết giao dịch |
| PUT | `/transactions/{id}` | Cập nhật |
| DELETE | `/transactions/{id}` | Xóa |

**Query params cho GET `/transactions`:**
```
?page=1
&per_page=20
&type=expense|income
&category_id=uuid
&wallet_id=uuid
&from_date=2026-06-01
&to_date=2026-06-30
&sort_by=transaction_date
&sort_order=desc
&search=keyword          # tìm trong description
```

**Response:**
```json
{
  "items": [...],
  "total": 150,
  "page": 1,
  "per_page": 20,
  "total_pages": 8
}
```

**Business logic khi tạo transaction:**
1. Validate category thuộc đúng type (income/expense)
2. Nếu có wallet_id → cập nhật balance: income +, expense -
3. Trả về transaction đã tạo kèm category info

### 4.5 Budgets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/budgets` | Danh sách budget tháng hiện tại |
| GET | `/budgets?month=6&year=2026` | Budget theo tháng/năm |
| POST | `/budgets` | Tạo/cập nhật budget cho category |
| PUT | `/budgets/{id}` | Cập nhật budget amount |
| DELETE | `/budgets/{id}` | Xóa budget |

**Response bao gồm `spent` (tính toán):**
```json
{
  "id": "uuid",
  "category": { "id": "uuid", "name": "Ăn uống", "icon": "🍕", "color": "#ef4444" },
  "amount": 5000000,
  "spent": 3200000,
  "remaining": 1800000,
  "percentage": 64.0,
  "month": 6,
  "year": 2026
}
```

### 4.6 Reports / Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/summary?month=6&year=2026` | Tổng thu/chi/số dư tháng |
| GET | `/reports/by-category?month=6&year=2026&type=expense` | Chi tiêu theo category |
| GET | `/reports/trend?months=6` | Xu hướng thu chi 6 tháng gần nhất |
| GET | `/reports/daily?month=6&year=2026` | Chi tiêu theo ngày trong tháng |

**GET `/reports/summary` Response:**
```json
{
  "month": 6,
  "year": 2026,
  "total_income": 25000000,
  "total_expense": 18500000,
  "net": 6500000,
  "transaction_count": 47
}
```

---

## 5. Frontend Pages

### 5.1 Auth Pages
- **Login** — Form email/password, link đến Register
- **Register** — Form email/name/password, tự tạo ví "Tiền mặt" mặc định

### 5.2 Dashboard (Trang chính)
Layout: Sidebar (desktop) / Bottom nav (mobile) + Header với user info

**Dashboard overview gồm:**
- 3 cards: Tổng thu / Tổng chi / Số dư tháng này
- Biểu đồ tròn (Pie) chi tiêu theo category
- Biểu đồ cột (Bar) thu chi 7 ngày gần nhất
- Danh sách 5 giao dịch gần nhất
- Budget overview: progress bars cho top 3 budgets

### 5.3 Transactions Page
- Bảng/danh sách giao dịch với infinite scroll hoặc pagination
- Bộ lọc: khoảng ngày, loại (thu/chi), category, ví
- Nút thêm giao dịch → mở modal/drawer
- Swipe để xóa (mobile)

### 5.4 Budgets Page
- Grid cards cho từng budget: tên category, thanh progress, số tiền đã chi / hạn mức
- Nút thêm budget mới
- Cảnh báo khi chi vượt 80% và 100%

### 5.5 Wallets Page
- Danh sách ví với balance
- Tổng balance tất cả ví
- CRUD ví

### 5.6 Reports Page
- Chọn tháng/năm
- Pie chart chi tiêu theo category
- Line chart xu hướng 6 tháng
- Bar chart thu chi theo ngày
- Bảng tổng hợp theo category

### 5.7 Settings Page
- Đổi tên, currency
- Đổi mật khẩu
- Đăng xuất

---

## 6. Authentication Flow

```
1. User đăng ký/đăng nhập → Backend trả access_token (15min) + refresh_token (7 days)
2. Frontend lưu tokens trong memory (Zustand) + httpOnly cookie cho refresh
3. Mỗi request API gắn header: Authorization: Bearer <access_token>
4. Khi access_token hết hạn → tự động gọi /auth/refresh
5. Nếu refresh cũng hết hạn → redirect về login
```

**Middleware bảo vệ routes:**
- Next.js middleware kiểm tra token, redirect /login nếu chưa auth
- FastAPI dependency `get_current_user` decode JWT và query user

---

## 7. Deployment Architecture

### 7.1 Frontend (Vercel)
- Push code lên GitHub → Vercel auto-deploy
- Environment variables: `NEXT_PUBLIC_API_URL`
- Preview deployments cho mỗi PR

### 7.2 Backend (GCP Cloud Run)

**Dockerfile:**
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY ./app ./app
COPY alembic.ini .
COPY alembic/ ./alembic/
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Deploy steps:**
```bash
# Build & push image
gcloud builds submit --tag gcr.io/PROJECT_ID/money-manager-api

# Deploy to Cloud Run
gcloud run deploy money-manager-api \
  --image gcr.io/PROJECT_ID/money-manager-api \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=postgresql://...
```

### 7.3 Database (GCP Cloud SQL)
- PostgreSQL 16 instance
- Private IP, chỉ Cloud Run access qua VPC connector
- Auto backup daily

### 7.4 CI/CD (GitHub Actions)

**Backend pipeline:**
```
Push → Lint (ruff) → Test (pytest) → Build Docker → Push to GCR → Deploy Cloud Run
```

**Frontend pipeline:**
```
Push → Lint (eslint) → Type check → Build → Vercel auto-deploy
```

---

## 8. Development Setup (Local)

**docker-compose.yml:**
```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: money_manager
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  api:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/money_manager
      SECRET_KEY: dev-secret-key
    depends_on:
      - db
    volumes:
      - ./backend/app:/app/app

volumes:
  pgdata:
```

**Chạy local:**
```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
python -m app.utils.seed   # Seed default categories
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

---

## 9. Tính năng ưu tiên (MVP cho 1 tuần)

### Must-have (Core)
1. Auth (register/login/JWT)
2. CRUD Transactions (thu/chi) với filter & pagination
3. CRUD Categories (defaults + custom)
4. Dashboard overview (tổng thu/chi/dư + biểu đồ đơn giản)
5. Budget management (đặt hạn mức + tracking)
6. Responsive UI (mobile-friendly)
7. Deploy live

### Nice-to-have (nếu còn thời gian)
1. Wallets (multi-wallet management)
2. Reports page với nhiều loại biểu đồ
3. Export CSV
4. Dark mode
5. Search transactions

### Ghi trong README nếu chưa kịp
- Recurring transactions (giao dịch định kỳ)
- Multi-currency support
- Data import/export
- Notifications khi vượt budget
- AI-powered spending insights

---

## 10. Conventions & Best Practices

### Backend
- **Naming:** snake_case cho functions/variables, PascalCase cho classes
- **Error handling:** Custom HTTPException với error codes rõ ràng
- **Validation:** Tất cả input đi qua Pydantic schemas
- **Testing:** Mỗi endpoint có ít nhất 1 happy path + 1 error case test
- **API versioning:** Prefix `/api/v1`

### Frontend
- **Naming:** camelCase cho variables, PascalCase cho components
- **State:** Server state = React Query, Client state = Zustand
- **API calls:** Tập trung trong `lib/api.ts`, hook wrappers trong `hooks/`
- **Components:** Tách nhỏ, single responsibility
- **TypeScript:** Strict mode, no `any`

### Git
- Branch naming: `feature/xxx`, `fix/xxx`
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`
- PR description template

---

## 11. Ước lượng Timeline (7 ngày)

| Ngày | Công việc |
|------|-----------|
| 1 | Setup project, Docker, DB schema, Alembic migrations, Auth API |
| 2 | CRUD APIs: categories, transactions, budgets |
| 3 | Reports API, business logic (budget tracking, aggregations) |
| 4 | Frontend: Auth pages, Layout (Sidebar/Header), Dashboard |
| 5 | Frontend: Transactions page, Budget page, Forms |
| 6 | Frontend: Reports/Charts, Settings, responsive, polish UI |
| 7 | Deploy (Vercel + GCP), viết README, testing, fix bugs |

---

## 12. Chat Feature — AI Query (Text-to-SQL via Function Calling)

### 12.1 Tổng quan

Tính năng chat cho phép user hỏi về dữ liệu tài chính bằng ngôn ngữ tự nhiên (tiếng Việt). Hệ thống dùng OpenAI function calling (gpt-4o-mini) để map câu hỏi thành các predefined safe functions thay vì sinh raw SQL — tránh hoàn toàn SQL injection.

**Pipeline 7 bước:**
1. User gửi câu hỏi → 2. POST `/api/v1/chat` → 3. OpenAI function calling chọn function phù hợp → 4. Function Router map sang SQLAlchemy query → 5. PostgreSQL thực thi → 6. OpenAI format kết quả thành tiếng Việt → 7. Trả response cho frontend

### 12.2 Cấu trúc thư mục bổ sung

```
backend/
├── app/
│   ├── api/
│   │   └── chat.py                    # POST /api/v1/chat endpoint
│   ├── services/
│   │   └── chat_service.py            # Function router + orchestration
│   ├── prompts/
│   │   ├── __init__.py
│   │   └── chat.py                    # System prompt + function definitions cho OpenAI
│   └── utils/
│       └── openai_client.py           # OpenAI client wrapper (singleton)

frontend/
├── components/
│   ├── chat/
│   │   ├── ChatWidget.tsx             # Floating button + badge
│   │   ├── ChatDrawer.tsx             # Slide-up drawer chứa conversation
│   │   ├── ChatMessage.tsx            # Bubble message (user/ai)
│   │   └── ChatSuggestions.tsx        # Quick suggestion chips
│   └── ...
├── hooks/
│   └── useChat.ts                     # React Query mutation + conversation state
├── types/
│   └── chat.ts                        # ChatMessage, ChatRequest, ChatResponse interfaces
└── ...
```

### 12.3 API Endpoint

```
POST /api/v1/chat
Headers: Authorization: Bearer <token>
Body: { "message": "Tháng này tôi chi nhiều nhất vào đâu?" }
Response 200:
{
  "answer": "Tháng 6/2026, bạn chi nhiều nhất vào Ăn uống (3.200.000₫, chiếm 35%), tiếp theo là Di chuyển (1.800.000₫, 20%)...",
  "function_called": "get_spending_by_category",
  "data": { ... }   // raw data cho frontend render chart nếu cần
}
```

Rate limit: **20 requests/phút/user** (Redis hoặc in-memory counter).

### 12.4 Predefined Safe Functions

| Function | Mô tả | Params |
|----------|--------|--------|
| `get_monthly_summary` | Tổng thu/chi/dư tháng | `month`, `year` |
| `get_spending_by_category` | Chi tiêu breakdown theo category | `month`, `year`, `top_n` |
| `compare_months` | So sánh 2 tháng | `month1`, `year1`, `month2`, `year2` |
| `get_top_transactions` | Giao dịch lớn nhất | `month`, `year`, `top_n`, `type` |
| `get_budget_status` | Tình trạng budget | `month`, `year` |
| `get_recent_transactions` | N giao dịch gần nhất | `limit`, `type` |

Mỗi function là một SQLAlchemy query có sẵn, luôn filter theo `user_id` từ JWT — user không thể truy cập data người khác.

### 12.5 Security

- **Không sinh raw SQL** — chỉ gọi predefined functions qua function calling
- **user_id scoping** — mọi query đều filter `WHERE user_id = current_user.id`
- **Rate limiting** — 20 req/min/user, trả 429 nếu vượt
- **Input sanitization** — message max 500 chars, strip HTML
- **OpenAI error fallback** — nếu function calling fail → trả message mặc định "Xin lỗi, tôi chưa hiểu câu hỏi. Bạn có thể hỏi lại không?"

### 12.6 Frontend Chat Widget

- **ChatWidget**: Floating button góc phải dưới (emerald-500), badge đếm unread
- **ChatDrawer**: Slide-up drawer (mobile) hoặc side panel (desktop), 400px wide
- **ChatSuggestions**: 4 chips gợi ý: "Tổng chi tháng này?", "So sánh tháng trước?", "Chi nhiều nhất vào đâu?", "Budget còn bao nhiêu?"
- **ChatMessage**: Bubble style, AI message hỗ trợ render mini chart (bar/pie) inline nếu `data` có trong response

### 12.7 Dependencies bổ sung

```
# backend/requirements.txt
openai>=1.30.0

# frontend/package.json
# Không cần thêm dependency — dùng React Query + Zustand có sẵn
```

---

## 13. Tính năng Nhập nhanh — NLP Quick-Add Transaction

### 13.1 Tổng quan

Cho phép user gõ (hoặc dán) một câu tiếng Việt tự nhiên mô tả một giao dịch, ví dụ `"ăn trưa 20k"`, `"cà phê 35k sáng nay"`, `"lương tháng 6 là 20tr"` — hệ thống dùng OpenAI (gpt-4o-mini, JSON mode / structured output) để tách câu thành các trường có cấu trúc: **số tiền, loại (thu/chi), danh mục, mô tả, ngày giao dịch**, kèm điểm tin cậy (confidence). User xem lại bản nháp, sửa nếu cần, rồi xác nhận 1 tap để tạo giao dịch thật — không có gì được ghi vào DB cho tới khi user xác nhận.

Đây khác với Chat feature (mục 12) ở chỗ: Chat trả lời câu hỏi (đọc dữ liệu), còn Quick-Add tạo dữ liệu mới (ghi giao dịch) từ ngôn ngữ tự nhiên.

**Pipeline 5 bước:**
1. User gõ câu vào ô "Nhập nhanh" → 2. POST `/api/v1/transactions/parse` kèm câu + danh sách category hiện có của user → 3. OpenAI parse thành JSON có cấu trúc, chọn category khớp nhất trong danh sách → 4. Backend validate & tính confidence → 5. Trả bản nháp (draft) cho frontend hiển thị thẻ xác nhận; nếu user bấm "Xác nhận", frontend gọi `POST /api/v1/transactions` (endpoint tạo giao dịch có sẵn) với dữ liệu đã parse (có thể chỉnh sửa trước khi gửi).

### 13.2 Cấu trúc thư mục bổ sung

```
backend/
├── app/
│   ├── prompts/
│   │   └── parse_transaction.py       # System prompt + JSON schema cho parse
│   ├── services/
│   │   └── transaction_parser.py      # Gọi OpenAI + match category + tính confidence
│   └── schemas/
│       └── transaction.py             # + TransactionParseRequest / TransactionParseResponse

frontend/
├── components/
│   └── transactions/
│       ├── quick-add-input.tsx        # Ô input "Nhập nhanh" + nút Parse
│       └── quick-add-confirm-card.tsx # Thẻ xác nhận: amount/category/type/date + badge confidence
├── hooks/
│   └── useQuickAdd.ts                 # State máy: idle → parsing → reviewing → confirmed
└── ...
```

### 13.3 API Endpoint

```
POST /api/v1/transactions/parse
Headers: Authorization: Bearer <token>
Body: { "text": "ăn trưa 20k" }
Response 200:
{
  "amount": 20000,
  "type": "expense",
  "category_id": "uuid-của-category-Ăn-uống",
  "category_name": "Ăn uống",
  "description": "Ăn trưa",
  "transaction_date": "2026-07-01",
  "confidence": 0.95,
  "raw_text": "ăn trưa 20k"
}
```

Response không tạo transaction — chỉ trả bản nháp. Tạo thật bằng cách gọi `POST /api/v1/transactions` với `category_id`, `amount`, `type`, `description`, `transaction_date` lấy từ response trên (frontend cho phép sửa trước khi submit).

Rate limit: dùng chung limiter 20 requests/phút/user với Chat feature.

### 13.4 Logic Parse & Category Matching

- OpenAI được cung cấp toàn bộ danh sách category (mặc định + custom) của user kèm `id`, `name`, `type` trong system prompt, và được yêu cầu trả về structured output đúng schema (amount, type, category_name, description, date_hint).
- Backend nhận `category_name` từ OpenAI, match với danh sách category thật của user (so khớp chính xác trước, sau đó fallback so khớp không phân biệt hoa/thường); nếu không khớp được category nào → dùng category "Khác" cùng loại.
- `date_hint` từ OpenAI (`today`, `yesterday`, ISO date, hoặc null) được backend resolve thành `transaction_date` thật (không để OpenAI tự tính ngày để tránh sai lệch timezone).
- **Confidence score** = trung bình có trọng số của: (a) OpenAI có trả về amount hợp lệ > 0 hay không, (b) category có match chính xác (1.0) hay fallback "Khác" (0.5), (c) OpenAI tự báo cáo độ chắc chắn (self-reported qua structured field `confidence_hint` 0–1). Nếu confidence < 0.6, frontend hiển thị cảnh báo "Vui lòng kiểm tra lại" và không cho auto-submit.

### 13.5 Security & Validation

- **user_id scoping** — danh sách category truyền cho OpenAI luôn lọc theo user hiện tại (default + custom), không leak category của user khác.
- **Input sanitization** — text tối đa 200 ký tự, strip HTML.
- **Không tự động ghi DB** — endpoint `/parse` chỉ đọc & trả JSON, việc tạo transaction vẫn đi qua endpoint `POST /transactions` hiện có (đã có validation category/wallet đầy đủ).
- **Rate limiting** — chung 20 req/phút/user với chat.
- **OpenAI error fallback** — nếu parse fail hoặc trả JSON không hợp lệ → HTTP 422 kèm message "Không hiểu được câu này, vui lòng nhập thủ công."

### 13.6 Frontend Quick-Add Flow

- **QuickAddInput**: ô input nổi bật ở đầu trang Giao dịch (và Dashboard), placeholder gợi ý: `"Nhập nhanh: ăn trưa 20k, cà phê 35k..."`
- Khi user nhấn Enter/nút Parse → gọi `/transactions/parse`, hiện trạng thái loading dạng "AI đang phân tích..."
- **QuickAddConfirmCard**: hiển thị bản nháp — số tiền, danh mục (có thể đổi qua dropdown), loại thu/chi, ngày, kèm badge % confidence (màu emerald nếu ≥90%, vàng nếu 60–89%, đỏ nếu <60%)
- Nút "Xác nhận & Lưu" → gọi `POST /transactions` với dữ liệu (đã chỉnh sửa nếu có) → đóng thẻ, refresh danh sách giao dịch
- Nút "Hủy" → đóng thẻ, không lưu gì

### 13.7 Dependencies bổ sung

```
# backend/requirements.txt
# Dùng chung openai>=1.30.0 đã khai báo ở mục 12.7

# frontend/package.json
# Không cần thêm dependency
```

---

## 14. Docker & CI/CD

### 14.1 Docker

- `backend/Dockerfile`: image `python:3.12-slim`, cài `requirements.txt`, chạy `uvicorn app.main:app`.
- `frontend/Dockerfile`: multi-stage build Next.js (deps → builder → runner với `output: standalone`), chạy `node server.js` trên port 3000.
- `docker-compose.yml` (root): 3 service — `db` (postgres:16), `api` (build từ `backend/`), `web` (build từ `frontend/`) — dùng để chạy toàn bộ stack local bằng `docker compose up`.

### 14.2 CI/CD (GitHub Actions)

- `.github/workflows/backend.yml`: trigger trên push/PR đụng tới `backend/**`.
  - Job `test`: dựng Postgres service container, cài dependencies, chạy `pytest`.
  - Job `deploy` (chỉ khi push nhánh `main` và job test pass): build & push Docker image lên Artifact Registry, deploy lên **Cloud Run** service `expense-test` tại region `asia-southeast1` (URL: `https://expense-test-500602.asia-southeast1.run.app`), dùng secret `GCP_PROJECT_ID` + `GCP_SA_KEY` (hoặc Workload Identity Federation).
- `.github/workflows/frontend.yml`: trigger trên push/PR đụng tới `frontend/**`.
  - Job `test`: `npm ci`, `npm run lint`, `npm run build`.
  - Job `deploy` (chỉ khi push `main`): build Docker image, deploy lên Cloud Run (hoặc Vercel nếu được cấu hình) trỏ `NEXT_PUBLIC_API_URL` về URL backend ở trên.

### 14.3 Môi trường (secrets cần cấu hình trên GitHub repo)

| Secret | Mô tả |
|--------|-------|
| `GCP_PROJECT_ID` | Project ID trên Google Cloud |
| `GCP_SA_KEY` | Service account key (JSON) có quyền deploy Cloud Run + push Artifact Registry |
| `OPENAI_API_KEY` | API key OpenAI, set làm biến môi trường Cloud Run cho backend |
| `DATABASE_URL` | Connection string Postgres production (Cloud SQL) |
| `SECRET_KEY` | JWT secret production |
