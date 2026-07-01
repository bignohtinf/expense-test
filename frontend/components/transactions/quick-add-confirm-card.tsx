'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Category, TransactionDraft } from '@/types';
import { Check, X, Sparkles } from 'lucide-react';

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function confidenceStyle(confidence: number) {
    if (confidence >= 0.9) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (confidence >= 0.6) return 'bg-amber-50 text-amber-600 border-amber-100';
    return 'bg-red-50 text-red-600 border-red-100';
}

export function QuickAddConfirmCard({
    draft,
    categories,
    saving,
    onChange,
    onConfirm,
    onCancel,
}: {
    draft: TransactionDraft;
    categories: Category[];
    saving: boolean;
    onChange: (patch: Partial<TransactionDraft>) => void;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    const filteredCategories = categories.filter(c => c.type === draft.type);
    const lowConfidence = draft.confidence < 0.6;

    return (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                    AI đã phân tích: &quot;{draft.raw_text}&quot;
                </div>
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${confidenceStyle(draft.confidence)}`}>
                    {Math.round(draft.confidence * 100)}% chắc chắn
                </span>
            </div>

            {lowConfidence && (
                <p className="text-xs text-red-500 font-medium">
                    Độ chắc chắn thấp — vui lòng kiểm tra lại thông tin trước khi lưu.
                </p>
            )}

            <div className="grid grid-cols-2 gap-3">
                <div className="flex gap-2 col-span-2">
                    <Button
                        type="button"
                        variant={draft.type === 'expense' ? 'default' : 'outline'}
                        className={draft.type === 'expense' ? 'bg-red-500 hover:bg-red-600 flex-1' : 'flex-1'}
                        onClick={() => onChange({ type: 'expense' })}
                    >Chi tiêu</Button>
                    <Button
                        type="button"
                        variant={draft.type === 'income' ? 'default' : 'outline'}
                        className={draft.type === 'income' ? 'bg-emerald-500 hover:bg-emerald-600 flex-1' : 'flex-1'}
                        onClick={() => onChange({ type: 'income' })}
                    >Thu nhập</Button>
                </div>

                <div>
                    <label className="text-xs text-slate-400">Số tiền</label>
                    <Input
                        type="number"
                        value={draft.amount}
                        onChange={(e) => onChange({ amount: parseFloat(e.target.value) || 0 })}
                    />
                </div>

                <div>
                    <label className="text-xs text-slate-400">Ngày</label>
                    <Input
                        type="date"
                        value={draft.transaction_date}
                        onChange={(e) => onChange({ transaction_date: e.target.value })}
                    />
                </div>

                <div className="col-span-2">
                    <label className="text-xs text-slate-400">Danh mục</label>
                    <select
                        className="w-full h-10 px-3 border rounded-md text-sm bg-white"
                        value={draft.category_id}
                        onChange={(e) => {
                            const cat = filteredCategories.find(c => c.id === e.target.value);
                            onChange({ category_id: e.target.value, category_name: cat?.name || draft.category_name });
                        }}
                    >
                        {filteredCategories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-span-2">
                    <label className="text-xs text-slate-400">Mô tả</label>
                    <Input
                        value={draft.description}
                        onChange={(e) => onChange({ description: e.target.value })}
                    />
                </div>
            </div>

            <div className="flex gap-2 pt-1">
                <Button
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5"
                    onClick={onConfirm}
                    disabled={saving || !draft.amount || !draft.category_id}
                >
                    <Check className="h-4 w-4" /> Xác nhận & Lưu {formatCurrency(draft.amount)}
                </Button>
                <Button variant="outline" className="gap-1.5" onClick={onCancel} disabled={saving}>
                    <X className="h-4 w-4" /> Hủy
                </Button>
            </div>
        </div>
    );
}
