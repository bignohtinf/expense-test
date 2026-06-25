"use client"

import { motion, useInView } from "framer-motion"
import { useState, useRef } from "react"
import Link from "next/link"

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.15,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 20,
        },
    },
}

export function Footer({ hideNewsletter = false }: { hideNewsletter?: boolean }) {
    const [email, setEmail] = useState("")
    const [isHovering, setIsHovering] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const footerRef = useRef(null)
    const isInView = useInView(footerRef, { once: true, margin: "-100px" })

    const handleSubmit = () => {
        setIsSubmitting(true)
        setTimeout(() => setIsSubmitting(false), 2000)
    }

    const footerLinks = [
        {
            title: "Giải Pháp",
            links: ["AI Extraction", "Rule Engine", "Fraud Detection", "AI Reasoning"],
        },
        {
            title: "Liên Kết",
            links: ["Trang Chủ", "Dịch Vụ", "Quy Trình", "Giải Pháp"],
        },
        {
            title: "Công Ty",
            links: ["Về Chúng Tôi", "Tuyển Dụng", "Báo Chí", "Liên Hệ"],
        },
        {
            title: "Pháp Lý",
            links: ["Chính Sách Bảo Mật", "Điều Khoản Dịch Vụ", "Chính Sách Cookie"],
        },
    ]

    return (
        <footer ref={footerRef} id="footer" className="relative bg-white pt-16 pb-6 overflow-hidden border-t border-blue-50">
            <div className="max-w-7xl mx-auto px-6">
                {!hideNewsletter && (
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl md:text-6xl font-black text-[#121212] tracking-tighter leading-[0.9] overflow-hidden">
                            <motion.span
                                className="block"
                                initial={{ y: 100 }}
                                whileInView={{ y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
                            >
                                BẮT ĐẦU
                            </motion.span>
                            <motion.span
                                className="block text-[#3B82F6]"
                                initial={{ y: 100 }}
                                whileInView={{ y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1], delay: 0.1 }}
                            >
                                NGAY HÔM NAY?
                            </motion.span>
                        </h2>
                    </motion.div>
                )}

                {!hideNewsletter && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-xl mx-auto mb-12"
                    >
                        <div className="flex flex-col sm:flex-row gap-3">
                            <motion.div className="flex-1 relative" whileFocus={{ scale: 1.02 }}>
                                <motion.input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full bg-white border-2 border-blue-100 rounded-xl px-4 py-3 text-[#121212] placeholder:text-[#121212]/40 font-mono text-sm focus:outline-none focus:border-[#3B82F6] transition-all duration-300"
                                    whileFocus={{ borderColor: "#3B82F6" }}
                                />
                                <motion.div
                                    className="absolute inset-0 rounded-xl pointer-events-none"
                                    animate={email.length > 0 ? { boxShadow: "0 0 20px rgba(175,255,0,0.2)" } : { boxShadow: "none" }}
                                />
                            </motion.div>
                            <motion.button
                                className="bg-[#3B82F6] text-white px-6 py-3 rounded-xl font-bold text-sm tracking-wide whitespace-nowrap relative overflow-hidden"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                onClick={handleSubmit}
                            >
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                    initial={{ x: "-100%" }}
                                    whileHover={{ x: "100%" }}
                                    transition={{ duration: 0.5 }}
                                />
                                <motion.span
                                    className="relative z-10"
                                    animate={isSubmitting ? { opacity: [1, 0.5, 1] } : {}}
                                    transition={{ duration: 0.5, repeat: isSubmitting ? Number.POSITIVE_INFINITY : 0 }}
                                >
                                    {isSubmitting ? "Đang Gửi..." : "Đăng Ký Nhận Tin"}
                                </motion.span>
                            </motion.button>
                        </div>
                        <motion.p
                            className="text-[#121212]/40 font-mono text-xs mt-2 text-center"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                        >
                            Nhận bản tin cập nhật về công nghệ InsurTech mới nhất.
                        </motion.p>
                    </motion.div>
                )}

                {!hideNewsletter && (
                    <motion.div
                        className="text-center mb-10"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                    >
                        <p className="text-[#121212]/60 font-mono text-xs max-w-xl mx-auto leading-relaxed">
                            Claira là hệ thống tự động hóa xét duyệt bồi thường bảo hiểm y tế hàng đầu, giúp doanh nghiệp tối ưu hóa quy trình và nâng cao trải nghiệm khách hàng bằng AI.
                        </p>
                    </motion.div>
                )}

                <motion.div
                    className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2 pb-8 border-t border-blue-50"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                >
                    {footerLinks.map((section, sectionIndex) => (
                        <motion.div key={section.title} variants={itemVariants}>
                            <h4 className="font-bold text-[#121212] text-sm mb-3">{section.title}</h4>
                            <ul className="space-y-2">
                                {section.links.map((item) => (
                                    <li key={item}>
                                        <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                                            <Link
                                                href="#"
                                                className="text-[#121212]/60 hover:text-[#3B82F6] font-mono text-xs transition-colors inline-block"
                                            >
                                                {item}
                                            </Link>
                                        </motion.div>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-blue-50 gap-3"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                >
                    <motion.div
                        className="flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <span className="text-xl font-black">
                            <span className="text-[#121212]">Cla</span>
                            <span className="text-[#3B82F6]">ira</span>
                        </span>
                    </motion.div>

                    <p className="text-[#121212]/40 font-mono text-xs">© 2026 Claira AI. All rights reserved.</p>

                    <motion.p
                        className="text-[#121212]/30 font-mono text-xs cursor-pointer"
                        onHoverStart={() => setIsHovering(true)}
                        onHoverEnd={() => setIsHovering(false)}
                        animate={
                            isHovering
                                ? {
                                    rotate: [0, -5, 5, -5, 5, 0],
                                    scale: [1, 1.1, 1],
                                    color: "#3B82F6",
                                }
                                : {
                                    rotate: 0,
                                    scale: 1,
                                    color: "rgba(18,18,18,0.3)",
                                }
                        }
                        transition={{ duration: 0.5 }}
                    >
                        made with energy
                    </motion.p>
                </motion.div>
            </div>

            <motion.div
                className="absolute bottom-[-3rem] left-1/2 -translate-x-1/2 text-[12rem] md:text-[25rem] font-black text-[#121212]/[0.02] pointer-events-none select-none leading-none"
                initial={{ y: 100, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
            >
                Claira
            </motion.div>
        </footer>
    )
}
