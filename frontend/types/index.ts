export interface User {
    id: string;
    email: string;
    full_name: string;
    currency: string;
    is_active: boolean;
    auth_provider: string;
    created_at: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    user: User;
}

export interface Wallet {
    id: string;
    name: string;
    balance: number;
    type: 'cash' | 'bank' | 'e_wallet' | 'credit_card';
    icon: string;
    is_active: boolean;
    created_at: string;
}

export interface Category {
    id: string;
    name: string;
    type: 'income' | 'expense';
    icon: string;
    color: string;
    is_default: boolean;
    created_at: string;
}

export interface Transaction {
    id: string;
    category_id: string;
    wallet_id: string | null;
    type: 'income' | 'expense';
    amount: number;
    description: string;
    transaction_date: string;
    created_at: string;
    category?: CategoryInfo;
    wallet?: WalletInfo;
}

export interface CategoryInfo {
    id: string;
    name: string;
    icon: string;
    color: string;
}

export interface WalletInfo {
    id: string;
    name: string;
    type: string;
}

export interface TransactionList {
    items: Transaction[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}

export interface Budget {
    id: string;
    category_id: string | null;
    amount: number;
    spent: number;
    remaining: number;
    percentage: number;
    month: number;
    year: number;
    created_at: string;
    category?: CategoryInfo;
}

export interface ReportSummary {
    month: number;
    year: number;
    total_income: number;
    total_expense: number;
    net: number;
    transaction_count: number;
}

export interface CategoryReport {
    category_id: string;
    category_name: string;
    icon: string;
    color: string;
    total: number;
    count: number;
    percentage: number;
}

export interface TrendItem {
    month: string;
    income: number;
    expense: number;
}

export interface DailyItem {
    date: string;
    income: number;
    expense: number;
}

// --- Chat (AI Query) feature ---
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    functionCalled?: string | null;
    data?: any;
    createdAt: string;
}

export interface ChatResponse {
    answer: string;
    function_called: string | null;
    data: any;
}

// --- NLP Quick-Add feature ---
export interface TransactionDraft {
    amount: number;
    type: 'income' | 'expense';
    category_id: string;
    category_name: string;
    description: string;
    transaction_date: string;
    confidence: number;
    raw_text: string;
}
