'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet } from 'lucide-react';
import type { ReportSummary, Transaction, CategoryReport } from '@/types';

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export default function DashboardPage() {
    const [summary, setSummary] = useState<ReportSummary | null>(null);
    const [recentTx, setRecentTx] = useState<Transaction[]>([]);
    const [categoryData, setCategoryData] = useState<CategoryReport[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const now = new Date();
                const [sum, tx, cat] = await Promise.all([
                    api.getReportSummary(now.getMonth() + 1, now.getFullYear()) as Promise<ReportSummary>,
                    api.getTransactions({ per_page: 5 }) as Promise<{ items: Transaction[] }>,
                    api.getReportByCategory(now.getMonth() + 1, now.getFullYear()) as Promise<CategoryReport[]>,
                ]);
                setSummary(sum);
                setRecentTx(tx.items);
                setCategoryData(cat);
            } catch (err) {
                console.error('Failed to load dashboard:', err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-black text-[#121212] tracking-tight">Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="p-6 animate-pulse">
                            <div className="h-4 w-20 bg-slate-200 rounded mb-3" />
                            <div className="h-8 w-32 bg-slate-200 rounded" />
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-black text-[#121212] tracking-tight">Dashboard</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6 border-emerald-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Thu nhập</p>
                            <p className="text-2xl font-black text-emerald-500 mt-1">
                                {formatCurrency(summary?.total_income || 0)}
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-red-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chi tiêu</p>
                            <p className="text-2xl font-black text-red-500 mt-1">
                                {formatCurrency(summary?.total_expense || 0)}
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
                            <ArrowDownRight className="h-5 w-5 text-red-500" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-blue-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Số dư</p>
                            <p className={`text-2xl font-black mt-1 ${(summary?.net || 0) >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                                {formatCurrency(summary?.net || 0)}
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <Card className="p-6">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Chi tiêu theo danh mục</h2>
                    {categoryData.length === 0 ? (
                        <p className="text-slate-400 text-sm py-8 text-center">Chưa có dữ liệu tháng này</p>
                    ) : (
                        <div className="space-y-3">
                            {categoryData.slice(0, 6).map((cat) => (
                                <div key={cat.category_id} className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                    <span className="text-sm font-medium text-slate-700 flex-1">{cat.category_name}</span>
                                    <span className="text-sm font-bold text-slate-500">{formatCurrency(cat.total)}</span>
                                    <span className="text-xs font-mono text-slate-400 w-12 text-right">{cat.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Recent Transactions */}
                <Card className="p-6">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Giao dịch gần đây</h2>
                    {recentTx.length === 0 ? (
                        <p className="text-slate-400 text-sm py-8 text-center">Chưa có giao dịch nào</p>
                    ) : (
                        <div className="space-y-3">
                            {recentTx.map((tx) => (
                                <div key={tx.id} className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs"
                                        style={{ backgroundColor: `${tx.category?.color}20`, color: tx.category?.color }}
                                    >
                                        {tx.category?.name?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-700 truncate">
                                            {tx.description || tx.category?.name || 'Giao dịch'}
                                        </p>
                                        <p className="text-xs text-slate-400">{tx.transaction_date}</p>
                                    </div>
                                    <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
