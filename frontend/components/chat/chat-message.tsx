'use client';

import type { ChatMessage as ChatMessageType } from '@/types';
import { Bot, User } from 'lucide-react';

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

/** Tiny inline bar chart — no chart library needed for a handful of bars. */
function MiniBarChart({ items }: { items: { label: string; value: number }[] }) {
    if (!items.length) return null;
    const max = Math.max(...items.map(i => i.value), 1);
    return (
        <div className="mt-2 space-y-1.5 rounded-xl bg-slate-50 border border-slate-100 p-3">
            {items.slice(0, 5).map((item, i) => (
                <div key={i} className="space-y-0.5">
                    <div className="flex justify-between text-[11px] text-slate-500">
                        <span className="truncate pr-2">{item.label}</span>
                        <span className="font-medium text-slate-700 shrink-0">{formatCurrency(item.value)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

function ChartFromData({ data }: { data: any }) {
    if (!data) return null;
    if (Array.isArray(data.categories)) {
        return <MiniBarChart items={data.categories.map((c: any) => ({ label: c.category, value: c.amount }))} />;
    }
    if (Array.isArray(data.transactions)) {
        return <MiniBarChart items={data.transactions.map((t: any) => ({ label: t.description || t.category, value: t.amount }))} />;
    }
    return null;
}

export function ChatMessageBubble({ message }: { message: ChatMessageType }) {
    const isUser = message.role === 'user';
    return (
        <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-slate-200 text-slate-600' : 'bg-emerald-500 text-white'}`}>
                {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${isUser ? 'bg-emerald-500 text-white rounded-tr-sm' : 'bg-slate-100 text-slate-700 rounded-tl-sm'}`}>
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                {!isUser && <ChartFromData data={message.data} />}
            </div>
        </div>
    );
}
