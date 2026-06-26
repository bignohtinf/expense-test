'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { Transaction, TransactionList, Category, Wallet } from '@/types';

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export default function TransactionsPage() {
    const [data, setData] = useState<TransactionList | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<string>('');
    const [dialogOpen, setDialogOpen] = useState(false);

    // Form state
    const [form, setForm] = useState({
        type: 'expense' as 'income' | 'expense',
        amount: '',
        category_id: '',
        wallet_id: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
    });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = { page, per_page: 15 };
            if (search) params.search = search;
            if (filterType) params.type = filterType;
            const result = await api.getTransactions(params) as TransactionList;
            setData(result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, search, filterType]);

    useEffect(() => { loadData(); }, [loadData]);

    useEffect(() => {
        async function loadMeta() {
            const [cats, wals] = await Promise.all([
                api.getCategories() as Promise<Category[]>,
                api.getWallets() as Promise<Wallet[]>,
            ]);
            setCategories(cats);
            setWallets(wals);
        }
        loadMeta();
    }, []);

    const handleCreate = async () => {
        if (!form.amount || !form.category_id) return;
        try {
            await api.createTransaction({
                ...form,
                amount: parseFloat(form.amount),
                wallet_id: form.wallet_id || null,
            });
            setDialogOpen(false);
            setForm({ type: 'expense', amount: '', category_id: '', wallet_id: '', description: '', transaction_date: new Date().toISOString().split('T')[0] });
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Xóa giao dịch này?')) return;
        await api.deleteTransaction(id);
        loadData();
    };

    const filteredCategories = categories.filter(c => c.type === form.type);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black text-[#121212] tracking-tight">Giao dịch</h1>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl gap-2" onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4" /> Thêm giao dịch
                </Button>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="font-black">Thêm giao dịch mới</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                            {/* Type toggle */}
                            <div className="flex gap-2">
                                <Button
                                    variant={form.type === 'expense' ? 'default' : 'outline'}
                                    className={form.type === 'expense' ? 'bg-red-500 hover:bg-red-600 flex-1' : 'flex-1'}
                                    onClick={() => setForm({ ...form, type: 'expense', category_id: '' })}
                                >Chi tiêu</Button>
                                <Button
                                    variant={form.type === 'income' ? 'default' : 'outline'}
                                    className={form.type === 'income' ? 'bg-emerald-500 hover:bg-emerald-600 flex-1' : 'flex-1'}
                                    onClick={() => setForm({ ...form, type: 'income', category_id: '' })}
                                >Thu nhập</Button>
                            </div>

                            <Input
                                type="number"
                                placeholder="Số tiền (VND)"
                                value={form.amount}
                                onChange={e => setForm({ ...form, amount: e.target.value })}
                            />

                            <select
                                className="w-full h-10 px-3 border rounded-md text-sm"
                                value={form.category_id}
                                onChange={e => setForm({ ...form, category_id: e.target.value })}
                            >
                                <option value="">-- Chọn danh mục --</option>
                                {filteredCategories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>

                            <select
                                className="w-full h-10 px-3 border rounded-md text-sm"
                                value={form.wallet_id}
                                onChange={e => setForm({ ...form, wallet_id: e.target.value })}
                            >
                                <option value="">-- Chọn ví (tùy chọn) --</option>
                                {wallets.map(w => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>

                            <Input
                                placeholder="Mô tả (tùy chọn)"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                            />

                            <Input
                                type="date"
                                value={form.transaction_date}
                                onChange={e => setForm({ ...form, transaction_date: e.target.value })}
                            />

                            <Button
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                                onClick={handleCreate}
                            >Tạo giao dịch</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Tìm kiếm..."
                        className="pl-9"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
                <select
                    className="h-10 px-3 border rounded-md text-sm"
                    value={filterType}
                    onChange={e => { setFilterType(e.target.value); setPage(1); }}
                >
                    <option value="">Tất cả</option>
                    <option value="income">Thu nhập</option>
                    <option value="expense">Chi tiêu</option>
                </select>
            </div>

            {/* Transaction List */}
            <Card className="divide-y">
                {loading ? (
                    <div className="p-8 text-center text-slate-400">Đang tải...</div>
                ) : data && data.items.length > 0 ? (
                    data.items.map((tx) => (
                        <div key={tx.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `${tx.category?.color}15`, color: tx.category?.color }}
                            >
                                {tx.type === 'income' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-slate-700 truncate">{tx.description || tx.category?.name}</p>
                                <p className="text-xs text-slate-400">{tx.category?.name} · {tx.transaction_date}</p>
                            </div>
                            <span className={`font-bold text-sm ${tx.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </span>
                            <button onClick={() => handleDelete(tx.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-slate-400">Chưa có giao dịch nào</div>
                )}
            </Card>

            {/* Pagination */}
            {data && data.total_pages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Trước</Button>
                    <span className="text-sm text-slate-500">Trang {data.page} / {data.total_pages}</span>
                    <Button variant="outline" size="sm" disabled={page >= data.total_pages} onClick={() => setPage(p => p + 1)}>Sau</Button>
                </div>
            )}
        </div>
    );
}
