'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layouts/header';
import { Sidebar, SidebarItem } from '@/components/layouts/sibebar';
import { ChatWidget } from '@/components/chat/chat-widget';
import { LayoutDashboard, ArrowLeftRight, PiggyBank, Wallet, BarChart3, Settings } from 'lucide-react';

const navItems: SidebarItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: 'Giao dịch', href: '/transactions', icon: <ArrowLeftRight className="h-4 w-4" /> },
    { label: 'Ngân sách', href: '/budgets', icon: <PiggyBank className="h-4 w-4" /> },
    { label: 'Ví tiền', href: '/wallets', icon: <Wallet className="h-4 w-4" /> },
    { label: 'Báo cáo', href: '/reports', icon: <BarChart3 className="h-4 w-4" /> },
    { label: 'Cài đặt', href: '/settings', icon: <Settings className="h-4 w-4" /> },
];

const headerNavItems = navItems.map(item => ({
    label: item.label,
    href: item.href,
    icon: item.icon,
}));

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [userName, setUserName] = useState('User');

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (!stored) {
            router.push('/auth/sign-in');
            return;
        }
        try {
            const parsed = JSON.parse(stored);
            setUserName(parsed.user?.full_name || parsed.full_name || 'User');
        } catch {
            router.push('/auth/sign-in');
        }
    }, [router]);

    return (
        <div className="min-h-screen bg-slate-50">
            <Header userName={userName} navItems={headerNavItems} />
            <Sidebar items={navItems} />
            <main className="md:ml-64 pt-28 pb-8 px-4 md:px-8">
                {children}
            </main>
            <ChatWidget />
        </div>
    );
}
