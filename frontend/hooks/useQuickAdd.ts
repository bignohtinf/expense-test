'use client';

import { useCallback, useState } from 'react';
import { api } from '@/lib/api';
import type { TransactionDraft } from '@/types';

type Status = 'idle' | 'parsing' | 'reviewing' | 'saving' | 'error';

export function useQuickAdd(onCreated?: () => void) {
    const [status, setStatus] = useState<Status>('idle');
    const [draft, setDraft] = useState<TransactionDraft | null>(null);
    const [error, setError] = useState<string | null>(null);

    const parse = useCallback(async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        setStatus('parsing');
        setError(null);
        try {
            const result = await api.parseTransaction(trimmed) as TransactionDraft;
            setDraft(result);
            setStatus('reviewing');
        } catch (err: any) {
            const message = err?.message === 'HTTP 429'
                ? 'Bạn đã nhập quá nhiều lần, vui lòng thử lại sau ít phút.'
                : (err?.message || 'Không hiểu được câu này, vui lòng nhập thủ công.');
            setError(message);
            setStatus('error');
        }
    }, []);

    const updateDraft = useCallback((patch: Partial<TransactionDraft>) => {
        setDraft(prev => (prev ? { ...prev, ...patch } : prev));
    }, []);

    const confirm = useCallback(async (walletId?: string) => {
        if (!draft) return;
        setStatus('saving');
        try {
            await api.createTransaction({
                category_id: draft.category_id,
                type: draft.type,
                amount: draft.amount,
                description: draft.description,
                transaction_date: draft.transaction_date,
                wallet_id: walletId || null,
            });
            setDraft(null);
            setStatus('idle');
            onCreated?.();
        } catch (err: any) {
            setError(err?.message || 'Không thể lưu giao dịch.');
            setStatus('reviewing');
        }
    }, [draft, onCreated]);

    const cancel = useCallback(() => {
        setDraft(null);
        setError(null);
        setStatus('idle');
    }, []);

    return { status, draft, error, parse, updateDraft, confirm, cancel };
}
