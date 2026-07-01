'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessageBubble } from '@/components/chat/chat-message';
import { ChatSuggestions } from '@/components/chat/chat-suggestions';
import { useChat } from '@/hooks/useChat';

export function ChatDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { messages, sending, sendMessage } = useChat();
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, sending]);

    if (!open) return null;

    const handleSend = () => {
        if (!input.trim()) return;
        sendMessage(input);
        setInput('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-end sm:p-6">
            <div className="absolute inset-0 bg-black/10 sm:hidden" onClick={onClose} />
            <div className="relative w-full sm:w-[400px] h-[85vh] sm:h-[560px] bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-black/5">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-emerald-500 to-teal-400 text-white shrink-0">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        <span className="font-bold text-sm">Trợ lý tài chính AI</span>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 rounded-lg p-1 transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500">
                                Hỏi tôi bất cứ điều gì về chi tiêu, thu nhập hoặc ngân sách của bạn.
                            </p>
                            <ChatSuggestions onPick={(s) => sendMessage(s)} />
                        </div>
                    ) : (
                        messages.map((m) => <ChatMessageBubble key={m.id} message={m} />)
                    )}
                    {sending && (
                        <div className="flex gap-2 items-center text-xs text-slate-400 pl-9">
                            <span className="inline-flex gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" />
                            </span>
                            Đang trả lời...
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="p-3 border-t flex gap-2 shrink-0">
                    <Input
                        placeholder="Nhập câu hỏi..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                        disabled={sending}
                    />
                    <Button
                        size="icon"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white shrink-0"
                        onClick={handleSend}
                        disabled={sending || !input.trim()}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
