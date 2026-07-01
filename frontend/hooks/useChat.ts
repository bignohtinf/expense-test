'use client';

import { useCallback, useState } from 'react';
import { api } from '@/lib/api';
import type { ChatMessage, ChatResponse } from '@/types';

function makeId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = useCallback(async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || sending) return;

        setError(null);
        const userMessage: ChatMessage = {
            id: makeId(),
            role: 'user',
            content: trimmed,
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMessage]);
        setSending(true);

        try {
            const res = await api.sendChatMessage(trimmed) as ChatResponse;
            const assistantMessage: ChatMessage = {
                id: makeId(),
                role: 'assistant',
                content: res.answer,
                functionCalled: res.function_called,
                data: res.data,
                createdAt: new Date().toISOString(),
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (err: any) {
            const message = err?.message === 'HTTP 429'
                ? 'Bạn đã hỏi quá nhiều, vui lòng thử lại sau ít phút.'
                : 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.';
            setError(message);
            setMessages(prev => [...prev, {
                id: makeId(),
                role: 'assistant',
                content: message,
                createdAt: new Date().toISOString(),
            }]);
        } finally {
            setSending(false);
        }
    }, [sending]);

    return { messages, sending, error, sendMessage };
}
