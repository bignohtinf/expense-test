'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { ChatDrawer } from '@/components/chat/chat-drawer';

export function ChatWidget() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(v => !v)}
                aria-label="Mở trợ lý tài chính AI"
                className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-all hover:scale-105"
            >
                {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </button>
            <ChatDrawer open={open} onClose={() => setOpen(false)} />
        </>
    );
}
