'use client';

const DEFAULT_SUGGESTIONS = [
    'Tổng chi tháng này?',
    'So sánh tháng trước?',
    'Chi nhiều nhất vào đâu?',
    'Budget còn bao nhiêu?',
];

export function ChatSuggestions({
    suggestions = DEFAULT_SUGGESTIONS,
    onPick,
}: {
    suggestions?: string[];
    onPick: (text: string) => void;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
                <button
                    key={s}
                    onClick={() => onPick(s)}
                    className="text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-colors"
                >
                    {s}
                </button>
            ))}
        </div>
    );
}
