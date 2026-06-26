'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import type { Budget, Category } from '@/types';

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export default function BudgetsPage() {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const now = new Date();
    const [month] = useState(now.getMonth() + 1);
    const [year] = useState(now.getFullYear());

    const [form, setForm] = useState({ category_id: '', amount: '' });

    const loadData = async () => {
        setLoading(true);
        try {
            const [b, c] = await Promise.all([
                api.getBudgets(month, year) as Promise<Budget[]>,
                api.getCategories('expense') as Promise<Category[]>,
            ]);
            setBudgets(b);
            setCategories(c);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [month, year]);

    const handleCreate = async () => {
        if (!form.amount || !form.category_id) return;
        await api.createBudget({
            category_id: form.category_id,
            amount: parseFloat(form.amount),
            month,
            year,
        });
        setDialogOpen(false);
        setForm({ category_id: '', amount: '' });
        loadData();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Xóa budget này?')) return;
        await api.deleteBudget(id);
        loadData();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-[#121212] tracking-tight">Ngân sách</h1>
                    <p className="text-sm text-slate-400">Tháng {month}/{year}</p>
                </div>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl gap-2" onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4" /> Thêm budget
                </Button>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent>
                        <DialogHeader><DialogTitle className="font-black">Thêm ngân sách</DialogTitle></DialogHeader>
                        <div className="space-y-4 pt-2">
                            <select
                                className="w-full h-10 px-3 border rounded-md text-sm"
                                value={form.category_id}
                                onChange={e => setForm({ ...form, category_id: e.target.value })}
                            >
                                <option value="">-- Chọn danh mục --</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <Input
                                type="number"
                                placeholder="Hạn mức (VND)"
                                value={form.amount}
                                onChange={e => setForm({ ...form, amount: e.target.value })}
                            />
                            <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleCreate}>Tạo budget</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-400">Đang tải...</div>
            ) : budgets.length === 0 ? (
                <Card className="p-12 text-center text-slate-400">
                    <p>Chưa có budget nào cho tháng này.</p>
                    <p className="text-xs mt-1">Nhấn &quot;Thêm budget&quot; để bắt đầu.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {budgets.map((b) => {
                        const isWarning = b.percentage >= 80;
                        const isOver = b.percentage >= 100;
                        return (
                            <Card key={b.id} className={`p-5 ${isOver ? 'border-red-200 bg-red-50/30' : isWarning ? 'border-amber-200 bg-amber-50/30' : ''}`}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${b.category?.color}20`, color: b.category?.color }}>
                                            {b.category?.name?.charAt(0) || '∑'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-700">{b.category?.name || 'Tổng'}</p>
                                            <p className="text-xs text-slate-400">{formatCurrency(b.spent)} / {formatCurrency(b.amount)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {isOver && <AlertTriangle className="h-4 w-4 text-red-500" />}
                                        <button onClick={() => handleDelete(b.id)} className="text-slate-300 hover:text-red-500">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <Progress value={Math.min(b.percentage, 100)} className={`h-2 ${isOver ? '[&>div]:bg-red-500' : isWarning ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'}`} />
                                <div className="flex justify-between mt-2">
                                    <span className={`text-xs font-bold ${isOver ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-emerald-500'}`}>{b.percentage}%</span>
                                    <span className="text-xs text-slate-400">Còn {formatCurrency(Math.max(b.remaining, 0))}</span>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
