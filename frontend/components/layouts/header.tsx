'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, LogOut, User, LayoutDashboard, FileText, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

interface HeaderProps {
    title: string;
    userRole?: 'customer' | 'adjudicator' | 'admin';
    userName?: string;
    navItems?: NavItem[];
}

export function Header({ title, userRole, userName = 'User', navItems = [] }: HeaderProps) {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('sessionToken');
        window.location.href = '/auth/login';
    };

    return (
        <div className="fixed top-6 inset-x-0 z-50 flex justify-center px-4">
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`w-full max-w-6xl transition-all duration-500 rounded-full border border-blue-100 shadow-xl overflow-hidden ${scrolled ? 'bg-white/95 backdrop-blur-md py-2' : 'bg-white/80 backdrop-blur-sm py-3'
                    }`}
            >
                <div className="flex items-center justify-between px-6 md:px-8">
                    {/* Logo Claira */}
                    <Link href="/" className="flex items-center gap-2">
                        <motion.span
                            className="text-2xl font-black tracking-tighter"
                            whileHover={{ scale: 1.05 }}
                        >
                            <span className="text-[#121212]">Cla</span>
                            <span className="text-[#3B82F6]">ira</span>
                        </motion.span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link key={item.href} href={item.href}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`relative px-4 font-bold text-sm uppercase tracking-tight transition-colors hover:text-[#3B82F6] ${isActive ? 'text-[#3B82F6]' : 'text-slate-500'
                                            }`}
                                    >
                                        {item.label}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeNavDashboard"
                                                className="absolute -bottom-1 left-4 right-4 h-0.5 bg-[#3B82F6] rounded-full"
                                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                            />
                                        )}
                                    </Button>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Section & Mobile Toggle */}
                    <div className="flex items-center gap-2">
                        <div className="hidden md:block">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="gap-3 font-bold border border-slate-100 rounded-full hover:bg-slate-50 px-4 h-10">
                                        <div className="h-6 w-6 rounded-full bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6]">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <span className="text-[#121212] text-xs uppercase tracking-widest">{userName}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-blue-50 shadow-xl mt-2">
                                    <div className="px-3 py-2 mb-2 border-b border-slate-50">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Đã đăng nhập</p>
                                        <p className="text-sm font-black text-[#121212] truncate">{userName}</p>
                                    </div>
                                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer font-bold text-slate-600 focus:text-[#3B82F6] focus:bg-blue-50">
                                        <Link href="/customer/profile" className="flex items-center">
                                            <User className="h-4 w-4 mr-2" />
                                            Hồ sơ cá nhân
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleLogout} className="rounded-xl cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50 font-bold">
                                        <div className="flex items-center">
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Đăng xuất
                                        </div>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <motion.button
                            className="md:hidden p-2 text-slate-600"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            whileTap={{ scale: 0.9 }}
                        >
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </motion.button>
                    </div>
                </div>

                {/* Mobile Navigation Dropdown */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden border-t border-slate-50 bg-white"
                        >
                            <div className="p-6 space-y-4">
                                {navItems.map((item) => (
                                    <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                                        <div className={`flex items-center gap-4 p-4 rounded-2xl font-black uppercase tracking-widest text-xs ${pathname === item.href ? 'bg-blue-50 text-[#3B82F6]' : 'text-slate-500'
                                            }`}>
                                            {item.icon}
                                            {item.label}
                                        </div>
                                    </Link>
                                ))}
                                <div className="pt-4 border-t border-slate-50">
                                    <div onClick={handleLogout} className="flex items-center gap-4 p-4 rounded-2xl font-black uppercase tracking-widest text-xs text-red-500 cursor-pointer">
                                        <LogOut className="h-4 w-4" />
                                        Đăng xuất
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>
        </div>
    );
}
