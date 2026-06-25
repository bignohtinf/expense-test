'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface SidebarItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    badge?: string;
}

interface SidebarProps {
    items: SidebarItem[];
    className?: string;
}

export function Sidebar({ items, className }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                'hidden h-screen w-64 border-r bg-sidebar md:fixed md:left-0 md:top-0 md:block md:flex-col md:overflow-y-auto',
                className
            )}
        >
            <nav className="space-y-2 p-4 pt-20">
                {items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={isActive ? 'default' : 'ghost'}
                                className="w-full justify-start gap-3"
                            >
                                {item.icon}
                                <span className="flex-1 text-left">{item.label}</span>
                                {item.badge && (
                                    <span className="text-xs font-semibold rounded-full bg-primary/20 px-2 py-0.5">
                                        {item.badge}
                                    </span>
                                )}
                            </Button>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
