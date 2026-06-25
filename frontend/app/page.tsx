'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FAQSection } from '@/components/utils/fraq-question';
import { Footer } from '@/components/layouts/footer';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#121212] font-sans overflow-x-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50 opacity-70" />
        <div className="absolute top-[-10%] left-1/4 w-[600px] h-[600px] bg-emerald-400/10 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="absolute bottom-[10%] right-1/4 w-[500px] h-[500px] bg-teal-400/10 rounded-full mix-blend-multiply filter blur-3xl" />
      </div>

      {/* Header — fixed, shrinks on scroll */}
      <div className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-4 transition-all duration-300">
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`w-full max-w-6xl transition-all duration-500 rounded-full border shadow-xl overflow-hidden ${
            scrolled
              ? 'bg-white/95 backdrop-blur-md py-2 border-emerald-100 shadow-emerald-500/5'
              : 'bg-white/70 backdrop-blur-sm py-3 border-slate-100/80 shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between px-6 md:px-8">
            <Link href="/" className="flex items-center gap-2">
              <motion.span
                className={`font-black tracking-tighter transition-all duration-300 ${scrolled ? 'text-xl' : 'text-2xl'}`}
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-[#121212]">Money</span>
                <span className="text-emerald-500">Mind</span>
              </motion.span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
              <a href="#features" className="hover:text-emerald-500 transition-colors">Tính năng</a>
              <a href="#how-it-works" className="hover:text-emerald-500 transition-colors">Cách hoạt động</a>
              <a href="#stats" className="hover:text-emerald-500 transition-colors">Số liệu</a>
              <a href="#faq" className="hover:text-emerald-500 transition-colors">FAQ</a>
            </nav>

            <div className="flex items-center gap-4">
              <Link
                href="/auth/sign-in"
                className="text-sm font-bold text-[#121212] hover:text-emerald-500 transition-colors px-4 py-2"
              >
                Đăng nhập
              </Link>
              <Link
                href="/auth/sign-in?mode=register"
                className={`text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-500/20 transition-all duration-300 ${
                  scrolled ? 'px-4 py-2' : 'px-5 py-2.5'
                }`}
              >
                Bắt đầu ngay
              </Link>
            </div>
          </div>
        </motion.header>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-24" />

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24 text-center md:text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-600 uppercase tracking-wider"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Quản lý chi tiêu thông minh
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-black tracking-tight text-[#121212] leading-[1.05]"
            >
              Kiểm soát <br />
              <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                Thu chi & Ngân sách
              </span> <br />
              dễ dàng hơn bao giờ hết
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-slate-600 max-w-xl leading-relaxed"
            >
              Ghi nhận giao dịch bằng ngôn ngữ tự nhiên, AI tự động phân loại chi tiêu, theo dõi ngân sách real-time và nhận insights thông minh mỗi tháng.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center md:justify-start"
            >
              <Link
                href="/auth/sign-in?mode=register"
                className="w-full sm:w-auto text-center font-black bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/25 transition-all duration-300 text-lg"
              >
                Bắt đầu miễn phí
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto text-center font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-8 py-4 rounded-2xl transition-all duration-200 text-lg shadow-sm"
              >
                Khám phá tính năng
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative flex justify-center"
          >
            <div className="w-full max-w-[480px] aspect-square relative bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-[3rem] p-1 shadow-2xl shadow-emerald-500/10 overflow-hidden group">
              <div className="absolute inset-0 bg-white/90 rounded-[2.85rem] p-8 flex flex-col justify-between">
                {/* NLP Input Demo */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                      <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">AI PARSED</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-mono text-slate-400 uppercase tracking-wider">Nhập giao dịch</div>
                    <div className="text-lg font-bold text-[#121212] bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">&quot;ăn phở 50k trưa nay&quot;</div>
                  </div>
                  <div className="h-px bg-slate-100" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-400">Số tiền</div>
                      <div className="text-lg font-bold text-[#121212]">50,000 đ</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Danh mục</div>
                      <div className="text-lg font-bold text-emerald-500">Ăn uống</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-400">Loại</div>
                      <div className="text-sm font-bold text-red-500">Chi tiêu</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Ngày</div>
                      <div className="text-sm font-bold text-[#121212]">Hôm nay</div>
                    </div>
                  </div>
                </div>
                {/* Confidence */}
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-600">Độ chính xác AI</span>
                  <span className="text-sm font-mono font-black text-emerald-500">95%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-100">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Cách hoạt động</h2>
          <p className="text-3xl md:text-5xl font-black tracking-tight text-[#121212]">3 bước đơn giản</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0 }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 mx-auto text-2xl font-black">1</div>
            <h3 className="text-xl font-bold text-[#121212]">Nói hoặc gõ</h3>
            <p className="text-slate-500">&quot;cà phê 35k sáng nay&quot; — chỉ cần nhập bằng ngôn ngữ tự nhiên, AI hiểu ngay.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 mx-auto text-2xl font-black">2</div>
            <h3 className="text-xl font-bold text-[#121212]">AI tự phân loại</h3>
            <p className="text-slate-500">Tự động nhận diện số tiền, danh mục, ngày tháng. Bạn chỉ cần xác nhận 1 tap.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 mx-auto text-2xl font-black">3</div>
            <h3 className="text-xl font-bold text-[#121212]">Theo dõi & Insights</h3>
            <p className="text-slate-500">Dashboard trực quan, budget alerts real-time, AI tổng kết chi tiêu cuối tháng.</p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-100">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Tính năng nổi bật</h2>
          <p className="text-3xl md:text-5xl font-black tracking-tight text-[#121212]">Mọi thứ bạn cần để quản lý tài chính</p>
          <p className="text-slate-500 text-lg">Từ ghi nhận chi tiêu hàng ngày đến phân tích xu hướng tài chính dài hạn.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-8 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#121212]">Nhập bằng ngôn ngữ tự nhiên</h3>
            <p className="text-slate-500 leading-relaxed">
              Gõ &quot;ăn phở 50k&quot; hoặc &quot;lương tháng 6 là 20tr&quot; — AI tự động parse thành giao dịch hoàn chỉnh với danh mục, số tiền và ngày tháng.
            </p>
          </div>

          <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-8 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#121212]">Báo cáo & Biểu đồ trực quan</h3>
            <p className="text-slate-500 leading-relaxed">
              Theo dõi luồng tiền qua biểu đồ tròn, cột và đường. So sánh chi tiêu theo tháng, phát hiện xu hướng chi tiêu bất thường.
            </p>
          </div>

          <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-8 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#121212]">Quản lý ngân sách thông minh</h3>
            <p className="text-slate-500 leading-relaxed">
              Đặt hạn mức cho từng danh mục, nhận cảnh báo khi sắp vượt budget. Progress bar real-time cho thấy bạn đang chi tiêu ở mức nào.
            </p>
          </div>

          <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-8 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#121212]">Đa ví</h3>
            <p className="text-slate-500 leading-relaxed">
              Quản lý nhiều ví cùng lúc: tiền mặt, ngân hàng, ví điện tử, thẻ tín dụng. Mỗi giao dịch gắn với ví cụ thể.
            </p>
          </div>

          <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-8 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#121212]">AI Spending Insights</h3>
            <p className="text-slate-500 leading-relaxed">
              Cuối tháng, AI tự tổng kết: &quot;Tháng này bạn chi cho Ăn uống tăng 35% so với tháng trước, chủ yếu vào cuối tuần.&quot;
            </p>
          </div>

          <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-8 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#121212]">Bảo mật & Riêng tư</h3>
            <p className="text-slate-500 leading-relaxed">
              Mã hóa JWT, dữ liệu tài chính được bảo vệ đa lớp. Mỗi user chỉ truy cập được dữ liệu của chính mình.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="bg-slate-50 relative z-10 py-20 border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-black text-emerald-500">95%</div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-widest font-bold">AI Parse chính xác</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-black text-emerald-500">&lt; 1s</div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-widest font-bold">Nhập giao dịch</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-black text-emerald-500">13+</div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-widest font-bold">Danh mục mặc định</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-black text-emerald-500">100%</div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-widest font-bold">Miễn phí sử dụng</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
