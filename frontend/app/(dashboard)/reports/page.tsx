'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import type { ReportSummary, CategoryReport, TrendItem, DailyItem } from '@/types';

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export default function ReportsPage() {
    const now = new Date();
    const [month] = useState(now.getMonth() + 1);
    const [year] = useState(now.getFullYear());
    const [summary, setSummary] = useState<ReportSummary | null>(null);
    const [categoryData, setCategoryData] = useState<CategoryReport[]>([]);
    const [trend, setTrend] = useState<TrendItem[]>([]);
    const [daily, setDaily] = useState<DailyItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [s, c, t, d] = await Promise.all([
                    api.getReportSummary(month, year) as Promise<ReportSummary>,
                    api.getReportByCategory(month, year) as Promise<CategoryReport[]>,
                    api.getReportTrend(6) as Promise<TrendItem[]>,
                    api.getReportDaily(month, year) as Promise<DailyItem[]>,
                ]);
                setSummary(s);
                setCategoryData(c);
                setTrend(t);
                setDaily(d);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        }
        load();
    }, [month, year]);

    if (loading) return <div className="text-center py-12 text-slate-400">Đang tải báo cáo...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-black text-[#121212] tracking-tight">Báo cáo — Tháng {month}/{year}</h1>

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                    <p className="text-xs text-slate-400 font-bold uppercase">Thu nhập</p>
                    <p className="text-lg font-black text-emerald-500">{formatCurrency(summary?.total_income || 0)}</p>
                </Card>
                <Card className="p-4 text-center">
                    <p className="text-xs text-slate-400 font-bold uppercase">Chi tiêu</p>
                    <p className="text-lg font-black text-red-500">{formatCurrency(summary?.total_expense || 0)}</p>
                </Card>
                <Card className="p-4 text-center">
                    <p className="text-xs text-slate-400 font-bold uppercase">Số dư</p>
                    <p className={`text-lg font-black ${(summary?.net || 0) >= 0 ? 'text-blue-500' : 'text-red-500'}`}>{formatCurrency(summary?.net || 0)}</p>
                </Card>
                <Card className="p-4 text-center">
                    <p className="text-xs text-slate-400 font-bold uppercase">Giao dịch</p>
                    <p className="text-lg font-black text-slate-700">{summary?.transaction_count || 0}</p>
                </Card>
            </div>

            {/* Category Breakdown */}
            <Card className="p-6">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Chi tiêu theo danh mục</h2>
                {categoryData.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">Không có dữ liệu</p>
                ) : (
                    <div className="space-y-3">
                        {categoryData.map((cat) => (
                            <div key={cat.category_id}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                        <span className="text-sm font-medium">{cat.category_name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold">{formatCurrency(cat.total)}</span>
                                        <span className="text-xs text-slate-400 w-12 text-right">{cat.percentage}%</span>
                                    </div>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Trend */}
            <Card className="p-6">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Xu hướng 6 tháng</h2>
                {trend.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">Không có dữ liệu</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 font-bold text-slate-400">Tháng</th>
                                    <th className="text-right py-2 font-bold text-emerald-500">Thu nhập</th>
                                    <th className="text-right py-2 font-bold text-red-500">Chi tiêu</th>
                                    <th className="text-right py-2 font-bold text-slate-600">Chênh lệch</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trend.map((t) => (
                                    <tr key={t.month} className="border-b border-slate-50">
                                        <td className="py-2 font-medium">{t.month}</td>
                                        <td className="py-2 text-right text-emerald-500">{formatCurrency(t.income)}</td>
                                        <td className="py-2 text-right text-red-500">{formatCurrency(t.expense)}</td>
                                        <td className={`py-2 text-right font-bold ${t.income - t.expense >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                                            {formatCurrency(t.income - t.expense)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}
