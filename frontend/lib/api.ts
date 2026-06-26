const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
    private getToken(): string | null {
        if (typeof window === 'undefined') return null;
        const user = localStorage.getItem('user');
        if (!user) return null;
        try {
            return JSON.parse(user).access_token;
        } catch {
            return null;
        }
    }

    private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
        const token = this.getToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...((options.headers as Record<string, string>) || {}),
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

        if (res.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('user');
                window.location.href = '/auth/sign-in';
            }
            throw new Error('Unauthorized');
        }

        if (!res.ok) {
            const error = await res.json().catch(() => ({ detail: 'Lỗi không xác định' }));
            throw new Error(error.detail || `HTTP ${res.status}`);
        }

        return res.json();
    }

    // Auth
    async login(email: string, password: string) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async register(email: string, password: string, fullName: string) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, full_name: fullName }),
        });
    }

    async getMe() {
        return this.request('/auth/me');
    }

    async updateProfile(data: { full_name?: string; currency?: string }) {
        return this.request('/auth/me', { method: 'PUT', body: JSON.stringify(data) });
    }

    async changePassword(data: { current_password: string; new_password: string }) {
        return this.request('/auth/change-password', { method: 'POST', body: JSON.stringify(data) });
    }

    // Wallets
    async getWallets() {
        return this.request('/wallets');
    }

    async createWallet(data: any) {
        return this.request('/wallets', { method: 'POST', body: JSON.stringify(data) });
    }

    async updateWallet(id: string, data: any) {
        return this.request(`/wallets/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    }

    async deleteWallet(id: string) {
        return this.request(`/wallets/${id}`, { method: 'DELETE' });
    }

    // Categories
    async getCategories(type?: string) {
        const query = type ? `?type=${type}` : '';
        return this.request(`/categories${query}`);
    }

    async createCategory(data: any) {
        return this.request('/categories', { method: 'POST', body: JSON.stringify(data) });
    }

    // Transactions
    async getTransactions(params: Record<string, any> = {}) {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => { if (v != null) query.set(k, String(v)); });
        return this.request(`/transactions?${query}`);
    }

    async createTransaction(data: any) {
        return this.request('/transactions', { method: 'POST', body: JSON.stringify(data) });
    }

    async updateTransaction(id: string, data: any) {
        return this.request(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    }

    async deleteTransaction(id: string) {
        return this.request(`/transactions/${id}`, { method: 'DELETE' });
    }

    // Budgets
    async getBudgets(month?: number, year?: number) {
        const query = new URLSearchParams();
        if (month) query.set('month', String(month));
        if (year) query.set('year', String(year));
        return this.request(`/budgets?${query}`);
    }

    async createBudget(data: any) {
        return this.request('/budgets', { method: 'POST', body: JSON.stringify(data) });
    }

    async updateBudget(id: string, data: any) {
        return this.request(`/budgets/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    }

    async deleteBudget(id: string) {
        return this.request(`/budgets/${id}`, { method: 'DELETE' });
    }

    // Reports
    async getReportSummary(month?: number, year?: number) {
        const query = new URLSearchParams();
        if (month) query.set('month', String(month));
        if (year) query.set('year', String(year));
        return this.request(`/reports/summary?${query}`);
    }

    async getReportByCategory(month?: number, year?: number, type = 'expense') {
        const query = new URLSearchParams({ type });
        if (month) query.set('month', String(month));
        if (year) query.set('year', String(year));
        return this.request(`/reports/by-category?${query}`);
    }

    async getReportTrend(months = 6) {
        return this.request(`/reports/trend?months=${months}`);
    }

    async getReportDaily(month?: number, year?: number) {
        const query = new URLSearchParams();
        if (month) query.set('month', String(month));
        if (year) query.set('year', String(year));
        return this.request(`/reports/daily?${query}`);
    }
}

export const api = new ApiClient();
