'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';

export function QuickAddInput({ parsing, onParse }: { parsing: boolean; onParse: (text: string) => void }) {
    const [text, setText] = useState('');

    const submit = () => {
        if (!text.trim() || parsing) return;
        onParse(text);
        setText('');
    };

    return (
        <div className="flex gap-2">
            <div className="relative flex-1">
                <Wand2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                <Input
                    placeholder="Nhập nhanh: ăn trưa 20k, cà phê 35k, lương tháng 6 là 20tr..."
                    className="pl-9"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
                    disabled={parsing}
                />
            </div>
            <Button
                className="bg-emerald-500 hover:bg-emerald-600 text-white shrink-0"
                onClick={submit}
                disabled={parsing || !text.trim()}
            >
                {parsing ? 'Đang phân tích...' : 'AI Parse'}
            </Button>
        </div>
    );
}
