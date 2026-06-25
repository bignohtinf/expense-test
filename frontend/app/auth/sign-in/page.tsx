'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from '@/lib/form-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AuthPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'register');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const loginForm = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const registerForm = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: { fullName: '', email: '', password: '', confirmPassword: '', acceptTerms: true },
    });

    useEffect(() => {
        const oauthError = searchParams.get('error');
        if (!oauthError) return;
        const errorMessages: Record<string, string> = {
            google_cancelled: 'Đăng nhập Google bị hủy.',
            google_token_failed: 'Không thể xác thực với Google. Vui lòng thử lại.',
            google_userinfo_failed: 'Không lấy được thông tin từ Google. Vui lòng thử lại.',
            email_not_verified: 'Email Google của bạn chưa được xác minh.',
            account_locked: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.',
            server_error: 'Lỗi máy chủ. Vui lòng thử lại sau.',
        };
        setError(errorMessages[oauthError] ?? 'Đã có lỗi xảy ra khi đăng nhập với Google.');
    }, [searchParams]);

    const onLoginSubmit = async (data: LoginInput) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: data.email, password: data.password }),
            });
            const json = await res.json();
            if (!res.ok) { setError(json.error ?? 'Email hoặc mật khẩu không chính xác'); setIsLoading(false); return; }
            localStorage.setItem('user', JSON.stringify(json.user));
            router.push('/dashboard');
        } catch { setError('Đã có lỗi xảy ra. Vui lòng thử lại.'); setIsLoading(false); }
    };

    const onRegisterSubmit = async (data: RegisterInput) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: data.email, password: data.password, fullName: data.fullName }),
            });
            const json = await res.json();
            if (!res.ok) { setError(json.error ?? 'Email đã được đăng ký'); setIsLoading(false); return; }
            localStorage.setItem('user', JSON.stringify(json.user));
            router.push('/dashboard');
        } catch { setError('Đã có lỗi xảy ra. Vui lòng thử lại.'); setIsLoading(false); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center overflow-hidden bg-white relative">
            {/* Background Effects */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />
                <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-emerald-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
                <div className="absolute bottom-[10%] right-1/4 w-[400px] h-[400px] bg-teal-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, #121212 25%, transparent 27%), linear-gradient(90deg, transparent 24%, #121212 25%, transparent 27%)', backgroundSize: '40px 40px' }} />
            </div>

            <div className="relative z-10 w-full max-w-6xl mx-auto px-4 pt-4 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center -translate-y-8">
                    {/* Left Text Column */}
                    <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="space-y-8">
                        <div className="space-y-4">
                            <Link href="/">
                                <motion.div whileHover={{ scale: 1.05 }} className="inline-block">
                                    <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.85]">
                                        <span className="text-[#121212]">Money</span>
                                        <span className="text-emerald-500">Mind</span>
                                    </h1>
                                </motion.div>
                            </Link>
                            <div className="w-24 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl md:text-3xl font-bold text-[#121212] tracking-tight">Quản lý chi tiêu thông minh</h2>
                            <p className="text-lg leading-relaxed text-slate-600 max-w-md">
                                {isLogin
                                    ? "Đăng nhập để theo dõi thu chi, quản lý ngân sách và nhận insights tài chính từ AI."
                                    : "Tạo tài khoản miễn phí để bắt đầu kiểm soát tài chính cá nhân một cách thông minh."}
                            </p>
                        </div>

                        <div className="flex items-center gap-6 pt-4">
                            <div className="space-y-1">
                                <div className="text-2xl font-bold text-emerald-500">&lt; 1s</div>
                                <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">Nhập giao dịch</div>
                            </div>
                            <div className="w-px h-10 bg-slate-200" />
                            <div className="space-y-1">
                                <div className="text-2xl font-bold text-emerald-500">AI</div>
                                <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">Auto-categorize</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: 3D Flip Container */}
                    <div className="relative [perspective:2000px]">
                        <motion.div
                            animate={{ rotateY: isLogin ? 0 : 180 }}
                            transition={{ duration: 0.8, type: "spring", stiffness: 260, damping: 20 }}
                            style={{ transformStyle: "preserve-3d" }}
                            className="relative w-full"
                        >
                            {/* Login Card (Front) */}
                            <div className="[backface-visibility:hidden]">
                                <AuthCard
                                    title="ĐĂNG NHẬP"
                                    subtitle="Welcome Back"
                                    isLogin={true}
                                    onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                                    form={loginForm}
                                    isLoading={isLoading}
                                    error={error}
                                    setError={setError}
                                    setIsLogin={setIsLogin}
                                    showPassword={showPassword}
                                    setShowPassword={setShowPassword}
                                />
                            </div>

                            {/* Register Card (Back) */}
                            <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                                <AuthCard
                                    title="ĐĂNG KÝ"
                                    subtitle="New Account"
                                    isLogin={false}
                                    onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                                    form={registerForm}
                                    isLoading={isLoading}
                                    error={error}
                                    setError={setError}
                                    setIsLogin={setIsLogin}
                                    showPassword={showPassword}
                                    setShowPassword={setShowPassword}
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AuthCard({ title, subtitle, isLogin, onSubmit, form, isLoading, error, setError, setIsLogin, showPassword, setShowPassword }: any) {
    return (
        <div className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] p-8 lg:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">
            <div className="space-y-6">
                <div className="text-center md:text-left">
                    <h2 className="text-3xl font-black text-[#121212] tracking-tighter uppercase">{title}</h2>
                    <p className="text-slate-400 text-sm mt-1 font-mono uppercase tracking-widest">{subtitle}</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Họ và tên</label>
                            <Input
                                {...form.register('fullName')}
                                placeholder="Nguyễn Văn A"
                                className="bg-white/50 border-slate-200 text-[#121212] focus:border-emerald-500 h-12 rounded-xl"
                            />
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Email</label>
                        <Input
                            {...form.register('email')}
                            type="email"
                            placeholder="email@address.com"
                            className="bg-white/50 border-slate-200 text-[#121212] focus:border-emerald-500 h-12 rounded-xl"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Mật khẩu</label>
                        <div className="relative">
                            <Input
                                {...form.register('password')}
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="bg-white/50 border-slate-200 text-[#121212] focus:border-emerald-500 h-12 rounded-xl"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold hover:text-emerald-500"
                            >
                                {showPassword ? "HIDE" : "SHOW"}
                            </button>
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Xác nhận mật khẩu</label>
                            <Input
                                {...form.register('confirmPassword')}
                                type="password"
                                placeholder="••••••••"
                                className="bg-white/50 border-slate-200 text-[#121212] focus:border-emerald-500 h-12 rounded-xl"
                            />
                        </div>
                    )}

                    {error && <div className="text-red-500 text-xs font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-6 rounded-xl shadow-xl shadow-emerald-500/25 transition-all duration-300"
                    >
                        {isLoading ? "ĐANG XỬ LÝ..." : isLogin ? "VÀO DASHBOARD" : "ĐĂNG KÝ NGAY"}
                    </Button>
                </form>

                {/* Google OAuth Button */}
                <div className="relative flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-widest shrink-0">hoặc</span>
                    <div className="flex-1 h-px bg-slate-200" />
                </div>

                <a
                    href="/api/auth/google"
                    className="flex items-center justify-center gap-3 w-full border border-slate-200 bg-white hover:bg-slate-50 text-[#121212] font-bold py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Tiếp tục với Google
                </a>

                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 gap-4">
                    <button
                        type="button"
                        onClick={() => { setIsLogin(!isLogin); setError(null); }}
                        className="text-sm font-bold text-emerald-500 hover:text-emerald-600 transition-colors uppercase tracking-tight"
                    >
                        {isLogin ? "Tạo tài khoản mới" : "Đã có tài khoản? Đăng nhập"}
                    </button>
                    <Link href="/" className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-tight">Về trang chủ</Link>
                </div>
            </div>
        </div>
    );
}
